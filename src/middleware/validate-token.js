const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

validateToken = (req, res, next) => {
    const { session_token } = req.headers

    jwt.verify(session_token, JWT_SECRET, (err, tokenDecoded) => {
        if (err) {
            res.status(401).json({
                error: { message: 'Not authorized' }
            })
        } else {
            req.userInfo = tokenDecoded
            next()
        }
    })
}

module.exports = {
    validateToken
}