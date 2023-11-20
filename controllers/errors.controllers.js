exports.handleRouteNotFoundError = (req, res, next) => {
    return res.status(404).send({msg: 'Not found'})
    .catch(next);
}