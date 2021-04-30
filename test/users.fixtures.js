const bcrypt = require('bcrypt')

const makeUsersArray = () => {
    const hashedPassword = bcrypt.hashSync('pass123', 10)
    return [
        {
            id: 1,
            first_name: 'Nicholas',
            last_name: 'Reid',
            username: 'Nreid3035',
            email: 'nreid3035@gmail.com',
            password: hashedPassword,
        },
        {
            id: 2,
            first_name: 'Hannah',
            last_name: 'Bozsik',
            username: 'HBoz89',
            email: 'hannahbozsik@gmail.com',
            password: hashedPassword,
        },
        {
            id: 3,
            first_name: 'Gleybar',
            last_name: 'Torres',
            username: 'Gleybebaby25',
            email: 'fakeemail@email.com',
            password: hashedPassword,
        },
        {
            id: 4,
            first_name: 'Gerrit',
            last_name: 'Cole',
            username: 'ColeWorld2014',
            email: 'fake@email.com',
            password: hashedPassword,
        }
    ]
} 

module.exports = {
    makeUsersArray
}