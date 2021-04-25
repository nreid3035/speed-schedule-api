const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')

describe('Speed Schedule signup/login endpoints', () => {
    let db

    before('make knex instance with test db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('speed_schedule_users'))

    afterEach('cleanup', () => db.raw('TRUNCATE speed_schedule_users RESTART IDENTITY CASCADE;'))

    describe('POST /api/signup', () => {
        context('given a valid signup request', () => {
            it('should respond with 201 created and the new user', () => {
                const validSignup = {
                    first_name: 'Nicholas',
                    last_name: 'Reid',
                    username: 'Nreid3035',
                    password: 'passwerd',
                    email: 'nreid3035@gmail.com'
                }

                return supertest(app)
                    .post('/api/signup')
                    .send(validSignup)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('password')
                        expect(res.body.first_name).to.eql(validSignup.first_name)
                        expect(res.body.last_name).to.eql(validSignup.last_name)
                        expect(res.body.username).to.eql(validSignup.username)
                        expect(res.body.email).to.eql(validSignup.email)
                    })
            })
        })

        context('given an invalid user request', () => {
            it('should respond with 400 bad request and error message', () => {
                const invalidSignup = {
                    first_name: 'Name',
                    name: 'faulty lastname',
                    username: 45,
                    password: ''
                }

                return supertest(app)
                    .post('/api/signup')
                    .send(invalidSignup)
                    .expect(400, {
                        error: { message: 'invalid input' }
                    })
            })
        })
    })

    describe('POST /api/login', () => {
        const testUsers = makeUsersArray()
        beforeEach('insert users into table', () => {
            return db
                .into('speed_schedule_users')
                .insert(testUsers)
        })

        context('given a valid username and password', () => {
            it('responds with 201 created and the users json web token', () => {
                const loginInfo = {
                    username: 'Nreid3035',
                    password: 'pass123'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(loginInfo)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('token')
                    })
            })
        })

        context('given an invalid username', () => {
            it('should respond with 404 and an error message saying user does not exist', () => {
                const badLogin = {
                    username: 'NotaUsername',
                    password: 'pass123'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(badLogin)
                    .expect(404, {
                        error: { message: 'User does not exist' }
                    })
            })
        })

        context('given an invalid password', () => {
            it('should respond with 401 and a message saying Credentials Error', () => {
                const badLogin = {
                    username: 'Nreid3035',
                    password: 'Wrong-Password'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(badLogin)
                    .expect(401, {
                        error: { message: 'Credentials Error' }
                    })
            })
        })
    })
})