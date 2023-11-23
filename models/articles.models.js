const db = require('../db/connection')

exports.selectArticles = (topic, sortBy = 'created_at', order = 'DESC') => {
    let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
    COUNT(comments.article_id) as comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id `
    const queryValues = []

    if(topic) {
        queryString += 'WHERE topic = $1 '
        queryValues.push(topic)
    }
    queryString += 'GROUP BY articles.article_id '

    
    queryString += `ORDER BY articles.${sortBy} ${order};`
    

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