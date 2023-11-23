const { deleteCommentById } = require('../controllers/app.controllers')

const commentsRouter = require('express').Router()

commentsRouter.delete('/:comment_id', deleteCommentById)

module.exports = commentsRouter