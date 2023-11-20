const express = require('express');
const { getTopics } = require('./controllers/app.controllers');
const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);


module.exports = app;