CREATE TABLE speed_schedule_scheduled_events (
    sched_event_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    username TEXT REFERENCES speed_schedule_users(username) ON DELETE CASCADE NOT NULL,
    event_id INTEGER REFERENCES speed_schedule_events(event_id) ON DELETE CASCADE NOT NULL,
    sched_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL 
)