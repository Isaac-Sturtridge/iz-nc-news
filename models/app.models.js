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
    return db.query(`SELECT * FROM articles;`).then((result) => {
        return result.rows
    })
}