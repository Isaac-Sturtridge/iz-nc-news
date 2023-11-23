const db = require('../db/connection')


exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((result) => {
        return result.rows
    })
}

exports.checkIfTopicExists = (topic) => {
    return db.query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Not found'})
        }
    })
}