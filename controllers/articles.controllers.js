const { selectArticleById, selectArticleComments, checkIfArticleExists, selectArticles, updateArticle } = require("../models/articles.models");
const { checkIfTopicExists } = require("../models/topics.models");

exports.getArticles = (req, res, next) => {
    const topic = req.query.topic
    const sortBy = req.query.sort_by
    const order = req.query.order

    const sortByWhitelist = ["article_id", "title", "topic", "author", "body", "created_at", "votes", "article_img_url"]
    
    if(sortBy && !sortByWhitelist.includes(sortBy)) {
        return res.status(400).send({msg: 'Bad request'})
    }
    
    const orderWhitelist = ["asc", "desc", "ASC", "DESC"]

    if(order && !orderWhitelist.includes(order)) {
        return res.status(400).send({msg: 'Bad request'})
    }

    const allPromises = [selectArticles(topic, sortBy, order)]

    if(topic) {
        allPromises.push(checkIfTopicExists(topic))
    }

    Promise.all(allPromises).then((result) => {
        const articles = result[0]
        return res.status(200).send({articles})
    }).catch(next)
}

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
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

exports.patchArticleById = (req, res, next) => {
    const id = req.params.article_id
    const newVotes = req.body.inc_votes
    updateArticle(newVotes, id).then((article) => {
        return res.status(200).send({article})
    }).catch(next)
}