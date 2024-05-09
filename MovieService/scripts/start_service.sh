# Initialize database schema and procedure trigger function
npm run api-knex migrate:latest
# Initlizize database seeding
npm run seeding
# Intialize defaut price and movie type has screen type if necessary
npm run start-initialize
# Start the service
pm2-runtime start ecosystem.config.js