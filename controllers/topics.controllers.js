const { selectTopics } = require("../models/topics.models")

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        return res.status(200).send({topics})
    }).catch(next)
}
