# Initialize database schema
npm run api-knex migrate:latest
# Start the service
pm2-runtime start ecosystem.config.js