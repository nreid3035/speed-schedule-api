require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, JWT_SECRET } = require('./config')
const UsersServiceObject = require('./users/users-service')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const eventsRouter = require('./events/events-router')
const scheduledEventsRouter = require('./scheduledEvents/scheduled-events-router')

const app = express()
const jsonParser = express.json()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/events', eventsRouter)
app.use('/api/scheduled-events', scheduledEventsRouter)

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
            UsersServiceObject.postNewUser(
                req.app.get('db'),
                newUser
            ).then(user => {
                return res.status(201).json(user)
            })
        })
    
})

app.post('/api/login', jsonParser, (req, res, next) => {

    const { username, password } = req.body

    UsersServiceObject.getUserByUsername(req.app.get('db'), username)
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    error: { message: 'User does not exist' }
                })
            }

            const sessionObj = {
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            }

            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                      jwt.sign(sessionObj, `${JWT_SECRET}`, { expiresIn: '60m' }, (err, token) => {
                          if(!err) {
                              return res.status(201).json({token})
                          } else {
                              res.status(406).json({
                                  error: { message: 'Error in token generation' }
                              })
                          }

                      })  
                    } else {
                        res.status(401).json({
                            error: { message: 'Credentials Error' }
                        })
                    }
                })
        })


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
