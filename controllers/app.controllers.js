const { selectTopics, selectEndpoints, selectArticleById } = require("../models/app.models")

exports.getEndpoints = (req, res, next) => {
    const endpoints = selectEndpoints();
    return res.status(200).send({endpoints})
}

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        return res.status(200).send({topics})
    }).catch(next)
}

exports.getArticleById = (req, res, next) => {
    const id = req.params["article_id"]
    selectArticleById(id).then((article) => {
        return res.status(200).send({article})
    }).catch(next)
}