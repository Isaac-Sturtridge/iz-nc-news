const { selectEndpoints } = require("../models/endpoints.models");

exports.getEndpoints = (req, res, next) => {
    const endpoints = selectEndpoints();
    return res.status(200).send({endpoints})
}
