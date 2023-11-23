const db = require('../db/connection')
const endpoints = require('../endpoints.json')

exports.selectEndpoints = () => {
    return endpoints
}

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((result) => {
        return result.rows
    })
}

exports.selectArticles = (topic) => {
    let queryString = 'SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, '
    queryString += 'COUNT(comments.article_id) as comment_count '
    queryString += 'FROM articles '
    queryString += 'LEFT JOIN comments ON articles.article_id = comments.article_id '
    const queryValues = []

    if(topic) {
        queryString += 'WHERE topic = $1 '
        queryValues.push(topic)
    }

    queryString += 'GROUP BY articles.article_id ORDER BY articles.created_at DESC;'
    return db.query(queryString, queryValues).then((result) => {
        return result.rows
    })
}

exports.selectArticleById = (id) => {
    let queryString = 'SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, '
    queryString += 'CAST(COUNT(comments.article_id) AS INT) as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id '
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

exports.selectArticleComments = (id) => {
    return db.query(`SELECT * FROM comments WHERE article_id = $1
    ORDER BY created_at DESC;`, [id])
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

exports.insertComment = (commentToAdd, id) => {
    const {body, username} = commentToAdd
    if(!body || Object.keys(commentToAdd).length !== 2) {
        return Promise.reject({status: 400, msg: 'Bad request'})
    }
    return db.query(`INSERT INTO comments
    (body, votes, author, article_id)
    VALUES
    ($1, 0, $2, $3)
    RETURNING *;`, [body, username, id])
    .then((result) => {
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

exports.removeComment = (id) => {
    return db.query(`DELETE FROM comments
    WHERE comment_id = $1;`, [id]).then((result) => {
        return result
    })
}

exports.checkIfCommentExists = (id) => {
    return db.query(`SELECT * FROM comments WHERE comment_id = $1`, [id])
    .then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Not found'})
        }
    })
}