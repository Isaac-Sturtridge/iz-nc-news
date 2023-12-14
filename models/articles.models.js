const db = require('../db/connection')

exports.selectArticles = (topic, sortBy = 'created_at', order = 'DESC', limit = 10, p = 1) => {
    let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
    CAST(COUNT(comments.article_id) AS INT) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id `
    const queryValues = []

    if(topic) {
        queryValues.push(topic)
        queryString += `WHERE topic = $${queryValues.length} `
    }
    queryString += 'GROUP BY articles.article_id '
    if(sortBy === "comment_count") {
        queryString += `ORDER BY comment_count ${order} `
    } else {
        queryString += `ORDER BY articles.${sortBy} ${order} `
    }
    
    queryValues.push(limit)
    queryString += `LIMIT $${queryValues.length} `
    queryValues.push((p-1) * limit)
    queryString += `OFFSET $${queryValues.length} `
    
    return db.query(queryString, queryValues).then((result) => {
        return result.rows
    })
}

exports.selectArticleById = (id) => {
    let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
    CAST(COUNT(comments.article_id) AS INT) as comment_count FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id `
    const queryValues = []

    queryString += 'WHERE articles.article_id = $1 '
    queryValues.push(id)

    queryString += 'GROUP BY articles.article_id ORDER BY articles.created_at DESC;'
    return db.query(queryString, queryValues).then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Not found'})
        }
        return result.rows[0]
    })
}

exports.selectArticleComments = (id, limit = 10, p = 1) => {
    let queryString = `SELECT * FROM comments WHERE article_id = $1
    ORDER BY created_at DESC `
    const queryValues = [id]

    queryValues.push(limit)
    queryString += `LIMIT $${queryValues.length} `
    queryValues.push((p-1) * limit)
    queryString += `OFFSET $${queryValues.length} `
    return db.query(queryString, queryValues)
    .then(result => {
        return result.rows
    }) 
}

exports.checkIfArticleExists = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [id])
    .then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Not found'})
        }
    })
}

exports.insertArticle = (newArticle) => {
    const {title, topic, author, body} = newArticle
    let article_img_url = 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
    if(newArticle.article_img_url) {
        article_img_url = newArticle.article_img_url
    }
    
    // TODO: create a function that will more robustly test whether article_img_url is a valid image url
    const acceptableImageFormats = ['.jpeg', '.png', '.jpg', '.svg']
    let okayImage = false
    acceptableImageFormats.forEach((imgFormat) => {
        if(article_img_url.includes(imgFormat)) {
            okayImage = true
        }
    })
    if(!okayImage) {
        return Promise.reject({status: 400, msg: 'Bad request'})
    }
    return db.query(`INSERT INTO articles
    (title, topic, author, body, article_img_url)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *`, [title, topic, author, body, article_img_url])
    .then((result) => {
        // all new articles will have a comment count of 0 - further requests for this statistic will use getArticleById endpoint which queries the comments table
        result.rows[0].comment_count = 0
        return result.rows[0]
    })
}

exports.updateArticle = (votes, id) => {
    return db.query(`UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`, [votes, id])
    .then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Not found'})
        }
        return result.rows[0]
    })
}

exports.getOriginalArticleCount = (topic) => {
    if(topic) {
        return db.query(`SELECT * FROM articles WHERE topic = $1`, [topic])
    }
    return db.query(`SELECT * FROM articles`).then((result) => {
        return result
    })
}

exports.removeArticle = (id) => {
    return db.query(`DELETE FROM comments WHERE article_id = $1`, [id])
    .then(() => {
        return db.query(`DELETE FROM articles
        WHERE article_id = $1`, [id])
    }).then((result) => {
        return result
    })
    
}