const { selectTopics } = require("../models/app.models")

exports.getTopics = (req, res) => {
    selectTopics().then((rows) => {
        return res.status(200).send(rows)
    })
}