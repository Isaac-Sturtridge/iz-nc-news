const { getEndpoints } = require('../controllers/endpoints.controllers');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');

const apiRouter = require('express').Router();

apiRouter.use('/users', usersRouter)
apiRouter.use('/topics', topicsRouter)
apiRouter.use('/comments', commentsRouter)
apiRouter.use('/articles', articlesRouter)


apiRouter.get('/', getEndpoints)

module.exports = apiRouter