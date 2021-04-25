const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')
const { makeEventsArray } = require('./events.fixtures')
const { makeScheduledEventsArray } = require('./scheduledEvents.fixtures')

// TEST USERS CREDENTIALS
const loginInfo = {
    username: 'Nreid3035',
    password: 'pass123'
}

const testUsers = makeUsersArray()
const testEvents = makeEventsArray()
const testScheduledEvents = makeScheduledEventsArray()

describe('Speed Schedule Endpoints', () => {
    let db 
    let token = null

    before('make knex instance with test db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('speed_schedule_users'))

    beforeEach('insert data into the table, authenticate user', () => {
        return db
            .into('speed_schedule_users')
            .insert(testUsers)
            .then(() => {
                return db
                    .into('speed_schedule_events')
                    .insert(testEvents)
                    .then(() => {
                        return db
                            .into('speed_schedule_scheduled_events')
                            .insert(testScheduledEvents)
                            .then(() => {
                                return supertest(app)
                                    .post('/api/login')
                                    .send(loginInfo)
                                    .expect(201)
                                    .then(res => {
                                        token = res.body.token
                                    })
                            })
                    })
            })
    })

    afterEach('cleanup', () => db.raw('TRUNCATE speed_schedule_users, speed_schedule_events, speed_schedule_scheduled_events'))

    describe('Speed Schedule /events endpoints', () => {
        describe('GET /api/events', () => {
            context('given no events', () => {
                it('should respond with 200 and an empty array')
            })

            context('given valid data', () => {
                it('should respond with 200 and an array of the events for the logged in user', () => {

                })
            })
        })

        describe('POST /api/events', () => {
            context('given an invalid request', () => {
                it('should respond with 400 bad request and an error message', () => {

                })
            })

            context('given an xss attack script', () => {
                it('should respond with the article sanitized', () => {

                })
            })

            context('given a valid request', () => {
                it('should respond with 201 created and the new event', () => {

                })
            })
        })
    })

})

describe('App', () => {
    it('GET / responds with 200 containing "Hello World!"', () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Hello World!')
    })
})