const { getArticleById, getArticleComments, getArticles, postComment, patchArticleById } = require('../controllers/app.controllers');
const articlesRouter = require('express').Router()


articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticleById)

articlesRouter.get('/:article_id/comments', getArticleComments)

articlesRouter.post('/:article_id/comments', postComment)

articlesRouter.patch('/:article_id', patchArticleById)

module.exports = articlesRouter