const db = require('../db/connection')

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