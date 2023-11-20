const express = require('express');
const { getTopics, getArticleById } = require('./controllers/app.controllers');
const { handleRouteNotFoundError, handlePsqlErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors.controllers');
const app = express();

app.get('/api/topics', getTopics);

app.get('/api/article/:article_id', getArticleById)

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app;