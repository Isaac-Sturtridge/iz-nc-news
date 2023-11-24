exports.handleRouteNotFoundError = (req, res, next) => {
    res.status(404).send({msg: 'Not found'})
}

exports.handlePsqlErrors = (err, req, res, next) => {
    const badRequestCodes = ['22P02', '2201W', '2201X']
    if(badRequestCodes.includes(err.code)) {
        res.status(400).send({msg: 'Bad request'})
    } else if(err.code === '23503') {
        res.status(404).send({msg: 'Not found'})
    } else {
        next(err)
    }
}

exports.handleCustomErrors = (err, req, res, next) => {
    if(err.status) {
        res.status(err.status).send({msg: err.msg})
    } else {
        next(err)
    }
}

exports.handleServerErrors = (err, req, res, next) => {
    res.status(500).send({msg: 'Internal Server Error'});
}