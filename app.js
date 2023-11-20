const express = require('express');
const { getEndpoints, getTopics } = require('./controllers/app.controllers');
const { handleRouteNotFoundError } = require('./controllers/errors.controllers');
const app = express();

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use((err, req, res, next) => {
    res.status(500).send({msg: 'Internal Server Error'});
})

module.exports = app;