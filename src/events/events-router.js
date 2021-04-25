require('dotenv').config()
const express = require('express')
const EventsServiceObject = require('./events-service')
const xss = require('xss')

const eventsRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require()

const sanitizeThatEvent = (eventObj) => {
    eventObj.event_name = xss(eventObj.event_name)
    eventObj.notes = xss(eventObj.notes)
}

eventsRouter
    .route('/')
    .get(validateToken, (req, res, next) => {
        const { username } = req.userInfo

        const knexInstance = req.app.get('db')

        EventsServiceObject.getAllEventsByUsername(knexInstance, username)
        .then(events => {
            res.status(200).json(events)
        })
        .catch(next)
    })

    .post(validateToken, jsonParser, (req, res, next) => {
        const { event_name, duration, notes } = req.body
        const { username } = req.userInfo

        const newEvent = {
            username: username,
            event_name: event_name,
            duration: duration,
            notes: notes
        }

        sanitizeThatEvent(newEvent)

        const knexInstance = req.app.get('db')

        EventsServiceObject.postEvent(knexInstance, newEvent)
            .then(eventObj => {
                res
                  .status(201)
                  .location(`/api/events/${eventObj.event_id}`)
                  .json(eventObj)
            })
            .catch(next)
    })