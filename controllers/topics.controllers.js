const { selectTopics, insertTopic } = require("../models/topics.models")

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        return res.status(200).send({topics})
    }).catch(next)
}

exports.postTopic = (req, res, next) => {
    const newTopic = req.body
    insertTopic(newTopic).then((topic) => {
        return res.status(201).send({topic})
    }).catch(next)
}