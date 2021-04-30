require('dotenv').config()
const express = require('express')
const EventsServiceObject = require('./events-service')
const xss = require('xss')

const eventsRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

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

        if (!username || !event_name || !duration) {
            return res.status(400).json({
                error: { message: 'Invalid request' }
            })
        }

        const newEvent = {
            username: username,
            event_name: event_name,
            duration: duration,
            notes: notes
        }

        console.log(newEvent)
        sanitizeThatEvent(newEvent)

        const knexInstance = req.app.get('db')

        EventsServiceObject.postEvent(knexInstance, newEvent)
            .then(eventObj => {
                res
                  .status(201)
                  .json(eventObj)
            })
            .catch(next)
    })

eventsRouter
    .route('/:eventId')
    .all(validateToken, (req, res, next) => {
        const { username } = req.userInfo 
        const { eventId } = req.params
        const knexInstance = req.app.get('db')

        EventsServiceObject.getEventById(knexInstance, eventId, username)
            .then(eventObj => {
                if (!eventObj) {
                    return res.status(404).json({
                        error: { message: 'Event does not exist' }
                    })
                }

                res.eventObj = eventObj
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
       res.status(200).json(res.eventObj)
    })
    .delete((req, res, next) => {
        const { username } = req.userInfo
        const { eventId } = req.params
        const knexInstance = req.app.get('db')

        EventsServiceObject.deleteEventById(knexInstance, eventId, username)
            .then(numRowsAffected => {
                return res.status(204).end()
            })
            .catch(next)
    })
    



module.exports = eventsRouter