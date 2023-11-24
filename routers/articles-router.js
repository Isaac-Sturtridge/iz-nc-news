const { getArticleById, getArticleComments, getArticles, postArticle, patchArticleById, deleteArticleById } = require('../controllers/articles.controllers');
const { postComment } = require('../controllers/comments.controllers');
const articlesRouter = require('express').Router()


articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticleById)

articlesRouter.get('/:article_id/comments', getArticleComments)

articlesRouter.post('/', postArticle)

articlesRouter.post('/:article_id/comments', postComment)

articlesRouter.patch('/:article_id', patchArticleById)

articlesRouter.delete('/:article_id', deleteArticleById)

module.exports = articlesRouter