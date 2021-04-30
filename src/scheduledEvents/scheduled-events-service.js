const ScheduledEventsService = {
    getAllScheduledEventsByUsername(knex, username) {
        return knex
            .select('*')
            .from('speed_schedule_scheduled_events')
            .where('username', username)
    },
    postNewScheduledEvent(knex, newScheduledEvent) {
        return knex
            .into('speed_schedule_scheduled_events')
            .insert(newScheduledEvent)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = ScheduledEventsService
