module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || "postgresql://nreid_super:postyPass72@localhost/speed_schedule_db",
    TEST_DB_URL: process.env.TEST_DB_URL || "postgresql://nreid_super:postyPass72@localhost/speed_schedule_test_db",
    JWT_SECRET: process.env.JWT_SECRET 
}