const EventsServiceObject = {
    getAllEventsByUsername(knex, username) {
        return knex
            .select('*')
            .from('speed_schedule_events')
            .where('username', username)
    },
    getEventById(knex, id) {
        return knex
            .select('*')
            .from('speed_schedule_events')
            .where('id', id)
            .first()
    },
    postEvent(knex, newEvent) {
        return knex
            .into('speed_schedule_events')
            .insert(newEvent)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteEventById(knex, id) {
        return knex('speed_schedule_events')
            .where({ id })
            .delete()
    }
}

module.exports = EventsServiceObject