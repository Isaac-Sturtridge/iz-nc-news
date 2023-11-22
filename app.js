const express = require('express');
const { getEndpoints, getTopics, getArticleById, getArticleComments, getArticles, postComment, patchArticleById, deleteCommentById } = require('./controllers/app.controllers');
const { handleRouteNotFoundError, handlePsqlErrors, handleCustomErrors, handleServerErrors} = require('./controllers/errors.controllers');
const { getUsers } = require('./controllers/users.controllers');

const app = express();

app.use(express.json())

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)

app.get('/api/article/:article_id', getArticleById)

app.get('/api/article/:article_id/comments', getArticleComments)

app.get('/api/users', getUsers)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id', patchArticleById)

app.delete('/api/comments/:comment_id', deleteCommentById)

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app;