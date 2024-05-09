# This command helps delete expired blacklisted token in database every hour.
0 */1 * * * /usr/local/bin/node /build/dist/main.js --delete_expired_blacklisted_token
