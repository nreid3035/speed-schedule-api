const knex = require('knex')
const pg = require('pg')
const app = require('./app')
pg.defaults.ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false

const { PORT, DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL
})

app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`)
})