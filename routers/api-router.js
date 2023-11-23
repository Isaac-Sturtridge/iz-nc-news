const { getEndpoints } = require('../controllers/app.controllers');

const apiRouter = require('express').Router();

apiRouter.get('/', getEndpoints)

module.exports = apiRouter