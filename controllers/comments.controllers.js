const { removeComment, checkIfCommentExists, insertComment, updateComment } = require("../models/comments.models")

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

exports.patchComment = (req, res, next) => {
    const id = req.params.comment_id
    const inc_votes = req.body.inc_votes

    updateComment(inc_votes, id).then((comment) => {
        return res.status(200).send({comment})
    })
}