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

    describe('Speed Schedule /api/events endpoints', () => {
        describe('GET /api/events', () => {
            context('given no events', () => {

                beforeEach('remove events from the table', () => {
                    return db.raw('TRUNCATE speed_schedule_events RESTART IDENTITY CASCADE')
                })

                it('should respond with 200 and an empty array', () => {
                    return supertest(app)
                        .get('/api/events')
                        .set('session_token', token)
                        .expect(200, [])
                })
            })

            context('given valid data', () => {
                it('should respond with 200 and an array of the events for the logged in user', () => {
                    const userEvents = testEvents.filter(eventObj => eventObj.username === loginInfo.username)
                    return supertest(app)
                        .get('/api/events')
                        .set('session_token', token)
                        .expect(200, userEvents)
                })
            })
        })

        describe('POST /api/events', () => {
            context('given an invalid request', () => {
                it('should respond with 400 bad request and an error message', () => {
                    const invalidEventPost = {
                        event_id: 15,
                        username: '',
                        event_name: 'Name',
                        duration: 0,
                        notes: ''
                    }

                    return supertest(app)
                        .post('/api/events')
                        .set('session_token', token)
                        .send(invalidEventPost)
                        .expect(400, {
                            error: { message: 'Invalid request' }
                        })
                })
            })

            context('given an xss attack script', () => {
                it('should respond with the article sanitized', () => {

                })
            })

            context('given a valid request', () => {
                it('should respond with 201 created and the new event', () => {
                    const validRequest = {
                        username: "Nreid3035",
                        event_name: "Flight",
                        duration: 180,
                        notes: "Baltimore to San Diego, remember gear"
                    }

                    return supertest(app)
                        .post('/api/events')
                        .set('session_token', token)
                        .send(validRequest)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('event_id')
                            expect(res.body.username).to.eql(validRequest.username)
                            expect(res.body.event_name).to.eql(validRequest.event_name)
                            expect(res.body.duration).to.eql(validRequest.duration)
                            expect(res.body.notes).to.eql(validRequest.notes)
                        })
                })
            })
        })

        describe('GET /api/events/:eventId', () => {
            context('given an id that does not exist', () => {
                it('should respond with 404 and an error message saying Event not found', () => {
                    const invalidId = 123456
                    
                    return supertest(app)
                        .get(`/api/events/${invalidId}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Event does not exist' }
                        })
                })
            })

            context('given an id for a user that is not logged in', () => {
                it('should respond with 404 not found', () => {
                    const wrongUsersId = 7

                    return supertest(app)
                        .get(`/api/events/${wrongUsersId}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Event does not exist' }
                        })
                })
            })

            context('given a valid id', () => {
                it('should respond with 200 and the corresponding id, only if token is valid', () => {
                    const validId = 2
                    const expectedEvent = testEvents.filter(eventObj => eventObj.event_id === validId)

                    return supertest(app)
                        .get(`/api/events/${validId}`)
                        .set('session_token', token)
                        .expect(200, expectedEvent[0])
                })
            })
        })

        describe('DELETE /api/events/:eventId', () => {
            context('given an id that does not exist', () => {
                it('should respond with 404 and an error message saying Event does not exist', () => {
                    const id = 123456

                    return supertest(app)
                        .delete(`/api/events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Event does not exist' }
                        })
                })
            })

            context('given an id for an event associated with a different account', () => {
                it('should respond with 401 unauthorized', () => {
                    const id = 7

                    return supertest(app)
                        .delete(`/api/events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Event does not exist' }
                        })
                })
            })

            context('given a valid id', () => {
                it('should respond with 204 no content, and the dataset should not contain the deleted event', () => {
                    const id = 2

                    return supertest(app)
                        .delete(`/api/events/${id}`)
                        .set('session_token', token)
                        .expect(204)
                        .expect(res => 
                            supertest(app)
                              .get(`/api/events/${id}`)
                              .set('session_token', token)
                              .expect(404), {
                                  error: { message: 'Event does not exist' }
                              }
                              )
                })
            })
        })
    })

    describe('Speed Schedule /api/scheduled-events endpoints', () => {
        describe('GET /api/scheduled-events', () => {
            context('given no data', () => {

                beforeEach('remove data from speed_schedule_scheduled_events', () => {
                    return db.raw('TRUNCATE speed_schedule_scheduled_events RESTART IDENTITY CASCADE;')
                })

                it('should respond with 200 and an empty array', () => {
                    return supertest(app)
                        .get('/api/scheduled-events')
                        .set('session_token', token)
                        .expect(200, [])
                })
            })

            context('given valid data', () => {
                it('should respond with 200 and the events for that user', () => {
                    const expectedSched = testScheduledEvents.filter(schedEvent => schedEvent.username === loginInfo.username)

                    return supertest(app)
                        .get('/api/scheduled-events')
                        .set('session_token', token)
                        .expect(200, expectedSched)
                })
            })
        })

        describe.only('POST /api/scheduled-event', () => {
            context('given an invalid request', () => {
                it('should respond with 400 and an error message', () => {
                    const invalidRequest = {
                        username: 'Nreid3035',
                        event_id: 2,
                        sched_date: "",
                        start_time: "1100",
                        end_time: "1300"
                    }

                    return supertest(app)
                        .post('/api/scheduled-events')
                        .set('session_token', token)
                        .send(invalidRequest)
                        .expect(400, {
                            error: { message: 'Invalid Request' }
                        })

                })
            })
            
            context('given an xss attack script', () => {
                it('should sanitize the user before submission', () => {

                })
            })

            context('given a valid request', () => {
                it('should respond with 201 and the new scheduled event', () => {
                    const validRequest = {
                        username: 'Nreid3035',
                        event_id: 2,
                        sched_date: "May 2nd 2021",
                        start_time: "1100",
                        end_time: "1300"
                    }

                    return supertest(app)
                        .post('/api/scheduled-events')
                        .set('session_token', token)
                        .send(validRequest)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('sched_event_id')
                            expect(res.body.username).to.eql(validRequest.username)
                            expect(res.body.sched_date).to.eql(validRequest.sched_date)
                            expect(res.body.start_time).to.eql(validRequest.start_time)
                            expect(res.body.end_time).to.eql(validRequest.end_time)
                        })
                })
            })
        })

        describe('GET /api/scheduled-events/date-lookup/:date', () => {
            context('given a date that does not exist', () => {
                it('should respond with an error message saying the request was invalid', () => {

                })
            }) 

            context('given a date that has no scheduled events', () => {
                it('should respond with 200 and an empty array', () => {

                })
            })

            context('given a date that has events scheduled', () => {
                it('should respond with 200 and the scheduled events for that day', () => {

                })
            })
        })

        describe('GET /api/scheduled-events/:schedId', () => {
            context('given an id that does not exist', () => {
                it('should respond with 404 not found and an error message', () => {
                    const id = 123456

                    return supertest(app)
                        .get(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Scheduled Event does not exist' }
                        })
                })
            })

            context('given an id that belongs to the scheduled event of another user', () => {
                it('should respond with 404 not found and an error message', () => {
                    const id = 7

                    return supertest(app)
                        .get(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Scheduled Event does not exist' }
                        })
                })
            })

            context('given a valid id', () => {
                it('should respond with 200 and the corresponding scheduled event, as well as the data of that event object', () => {
                    const id = 2
                    const expectedSchedEvent = testScheduledEvents.filter(schedEvent => schedEvent.sched_event_id === id)
                    return supertest(app)
                        .get(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(200, expectedSchedEvent)
                })
            })
        })

        describe('DELETE /api/scheduled-event/:schedId', () => {
            context('given an id that does not exist', () => {
                it('should respond with 404 not found and an error message', () => {
                    const id = 123456

                    return supertest(app)
                        .delete(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Scheduled Event does not exist' }
                        })
                })
            })

            context('given the id of a scheduled event not associated with the logged in user', () => {
                it('should respond with 404 not found and an error message', () => {
                    const id = 7

                    return supertest(app)
                        .delete(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Scheduled Event does not exist' }
                        })
                })
            })

            context('given a valid id', () => {
                it('should respond with 204 and should not be able to be found', () => {
                    const id = 2
                       
                    return supertest(app)
                        .delete(`/api/scheduled-events/${id}`)
                        .set('session_token', token)
                        .expect(204)
                        .expect(res =>
                            supertest(app)
                              .get(`/api/scheduled-events/${id}`)
                              .set('session_token', token)
                              .expect(404, {
                                  error: { message: 'Scheduled Event does not exist' }
                              })
                            )
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