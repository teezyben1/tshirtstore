const BigPromise = require('../middlewares/bigPromise')

exports.home = (req, res) => {
    res.status(200).send('hello')
}