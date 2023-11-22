const { selectTopics, selectEndpoints, selectArticleById, selectArticleComments, checkIfArticleExists, selectArticles, insertComment, updateArticle, removeComment, checkIfCommentExists } = require("../models/app.models")

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

exports.getArticleComments = (req, res, next) => {
    const id = req.params.article_id

    const allPromises = [selectArticleComments(id), checkIfArticleExists(id)]

    Promise.all(allPromises).then((result) => {
        const comments = result[0]
        return res.status(200).send({comments})
    }).catch(next)
}

exports.postComment = (req, res, next) => {
    const commentToAdd = req.body
    const id = req.params.article_id
    insertComment(commentToAdd, id).then((comment) => {
        return res.status(201).send({comment})
    }).catch(next)
}

exports.patchArticleById = (req, res, next) => {
    const id = req.params.article_id
    const newVotes = req.body.inc_votes
    updateArticle(newVotes, id).then((article) => {
        return res.status(200).send({article})
    }).catch(next)
}

exports.deleteCommentById = (req, res, next) => {
    const id = req.params.comment_id
    
    const allPromises = [removeComment(id), checkIfCommentExists(id)]

    Promise.all(allPromises).then(() => {
        return res.status(204).send()
    }).catch(next)
}