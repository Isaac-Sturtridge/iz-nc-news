const { selectTopics, selectEndpoints, selectArticleById, selectArticles, insertComment } = require("../models/app.models")

exports.getEndpoints = (req, res, next) => {
    const endpoints = selectEndpoints();
    return res.status(200).send({endpoints})
}

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        return res.status(200).send({topics})
    }).catch(next)
}

exports.getArticles = (req, res, next) => {
    selectArticles().then((articles) => {
        return res.status(200).send({articles})
    })
}
exports.getArticleById = (req, res, next) => {
    const id = req.params["article_id"]
    selectArticleById(id).then((article) => {
        return res.status(200).send({article})
    }).catch(next)
}

exports.postComment = (req, res, next) => {
    const commentToAdd = req.body
    const id = req.params.article_id
    insertComment(commentToAdd, id).then((comment) => {
        return res.status(201).send({comment})
    }).catch(next)
}