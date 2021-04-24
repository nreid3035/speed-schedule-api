require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const bcrypt = require('bcrypt')

const app = express()
const jsonParser = express.json()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.post('/api/signup', jsonParser, (req, res, next) => {
    const { username, password, email, first_name, last_name } = req.body
    if (!username || !password || !email || !first_name || !last_name) {
        return res.status(400).json({
            error: { message: 'invalid input' }
        })
    }

    bcrypt.hash(password, 10)
        .then(hashPassword => {
            const newUser = {
                username,
                password: hashPassword,
                email,
                first_name,
                last_name
            }

            // SUBMIT NEW USER TO DATABASE WITH SERVICE OBJECT
        })
    
})

app.post('/api/login', jsonParser, (req, res, next) => {

    const { username, password } = req.body

    
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if(NODE_ENV === 'production') {
        response = { error: { message: 'Server Error' }}
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app
