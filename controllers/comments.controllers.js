const { removeComment, checkIfCommentExists, insertComment } = require("../models/comments.models")

exports.postComment = (req, res, next) => {
    const commentToAdd = req.body
    const id = req.params.article_id
    insertComment(commentToAdd, id).then((comment) => {
        return res.status(201).send({comment})
    }).catch(next)
}

exports.deleteCommentById = (req, res, next) => {
    const id = req.params.comment_id
    
    const allPromises = [removeComment(id), checkIfCommentExists(id)]

    Promise.all(allPromises).then(() => {
        return res.status(204).send()
    }).catch(next)
}