const UsersServiceObject = {
    getAllUsers(knex) {
        return knex
            .select('*')
            .from('speed_schedule_users')
    },
    getUserByUsername(knex, username) {
        return knex
            .select('*')
            .from('speed_schedule_users')
            .where('username', username)
            .first()
    },
    getUserById(knex, id) {
        return knex
            .select('*')
            .from('speed_schedule_users')
            .where('id', id)
            .first()
    },
    postNewUser(knex, newUser) {
        return knex
            .into('speed_schedule_users')
            .insert(newUser)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteUserById(knex, id) {
        return knex('speed_schedule_users')
            .where({ id })
            .delete()
    }

}

module.exports = UsersServiceObject