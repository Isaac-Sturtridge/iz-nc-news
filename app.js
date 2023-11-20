const express = require('express');
const { getTopics } = require('./controllers/app.controllers');
const { handleRouteNotFoundError } = require('./controllers/errors.controllers');
const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);

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