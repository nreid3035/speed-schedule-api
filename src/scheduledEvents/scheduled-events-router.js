require('dotenv').config()
const express = require('express')
const ScheduledEventsService = require('./scheduled-events-service')
const xss = require('xss')

const scheduledEventsRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

scheduledEventsRouter
    .route('/')
    .get(validateToken, (req, res, next) => {
        const { username } = req.userInfo

        const knexInstance = req.app.get('db')

        ScheduledEventsService.getAllScheduledEventsByUsername(knexInstance, username)
            .then(schedEvents => {
                res.status(200).json(schedEvents)
            })
    })
    .post(validateToken, jsonParser, (req, res, next) => {
        const { username, event_id, sched_date, start_time, end_time } = req.body
        const newScheduledEvent = {
            username: username,
            event_id: event_id,
            sched_date: sched_date,
            start_time: start_time,
            end_time: end_time
        }

        if (!username || !event_id || !sched_date || !start_time || !end_time) {
            return res.status(400).json({
                error: { message: 'Invalid Request' }
            })
        }

        const knexInstance = req.app.get('db')

        ScheduledEventsService.postNewScheduledEvent(knexInstance, newScheduledEvent)
            .then(schedEvent => {
                console.log(schedEvent)
                res
                  .status(201)
                  .json(schedEvent)
            })


    })


module.exports = scheduledEventsRouter
