# Initialize database schema
npm run api-knex migrate:latest
# Intialize first user, first user role and first user permissions if necessary
npm run start-initialize
# Start the service
pm2-runtime start ecosystem.config.js