const express = require('express');
const { getEndpoints, getTopics, getArticleById, getArticles, getArticleComments, patchArticleById } = require('./controllers/app.controllers');
const { handleRouteNotFoundError, handlePsqlErrors, handleCustomErrors, handleServerErrors} = require('./controllers/errors.controllers');

const app = express();

app.use(express.json())

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)
app.get('/api/article/:article_id', getArticleById)

app.get('/api/article/:article_id/comments', getArticleComments)

app.patch('/api/articles/:article_id', patchArticleById)

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app;