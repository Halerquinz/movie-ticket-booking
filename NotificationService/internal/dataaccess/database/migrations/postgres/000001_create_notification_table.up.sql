CREATE TABLE IF NOT EXISTS notification_service_notification_tab (
    notification_id SERIAL PRIMARY KEY,
    of_booking_id INT UNIQUE,
    status SMALLINT,
    original_pdf_filename VARCHAR(255) UNIQUE NOT NULL
);

CREATE INDEX notification_service_notification_status_idx ON notification_service_notification_tab (status);
