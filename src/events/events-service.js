const EventsServiceObject = {
    getAllEventsByUsername(knex, username) {
        return knex
            .select('*')
            .from('speed_schedule_events')
            .where('username', username)
    },
    getEventById(knex, id, username) {
        return knex
            .select('*')
            .from('speed_schedule_events')
            .where('username', username)
            .where('event_id', id)
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
    deleteEventById(knex, id, username) {
        return knex('speed_schedule_events')
            .where('username', username)
            .where('event_id', id)
            .delete()
    }
}

module.exports = EventsServiceObject