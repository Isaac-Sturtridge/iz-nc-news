const express = require('express');
const { handleRouteNotFoundError, handlePsqlErrors, handleCustomErrors, handleServerErrors} = require('./controllers/errors.controllers');
const apiRouter = require('./routers/api-router');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json())

app.use('/api', apiRouter)

// must be after every other route
app.get('*', handleRouteNotFoundError);

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app;