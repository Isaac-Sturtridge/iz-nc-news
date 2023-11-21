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

exports.selectArticles = () => {
    return db.query(`SELECT 
    articles.author, 
    articles.title, 
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.article_id) as comment_count
    FROM articles
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY 
    articles.article_id
    ORDER BY articles.created_at DESC;`).then((result) => {
        return result.rows
    })
}

exports.selectArticleById = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [id]).then((result) => {
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
    if(!body) {
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