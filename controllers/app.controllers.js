const { selectTopics } = require("../models/app.models")

exports.getTopics = (req, res, next) => {
    selectTopics().then((rows) => {
        return res.status(200).send(rows)
    }).catch(next)
}