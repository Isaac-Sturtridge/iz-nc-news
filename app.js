const express = require('express');
const { getTopics, getArticleById } = require('./controllers/app.controllers');
const { handleRouteNotFoundError } = require('./controllers/errors.controllers');
const app = express();

app.get('/api/topics', getTopics);

app.get('/api/article/:article_id', getArticleById)

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use((err, req, res, next) => {
    if(err.status) {
        res.status(err.status).send({msg: err.msg})
    } else {
        res.status(500).send({msg: 'Internal Server Error'});
    }
})

module.exports = app;