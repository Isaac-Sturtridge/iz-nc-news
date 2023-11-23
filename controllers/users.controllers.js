const { selectUsers, selectUserByUsername } = require("../models/users.models")

exports.getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        return res.status(200).send({users})
    })
}

exports.getUserByUsername = (req, res, next) => {
    const username = req.params.username
    selectUserByUsername(username).then((user) => {
        return res.status(200).send({user})
    }).catch(next)
}