# Build stage
FROM node:20-bullseye
# Install NodeJs dependencies
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
RUN npm install
RUN npm install -g pm2
# Build package
COPY . .
RUN npm run build
# Start the server with 2 instances
ENV NODE_ENV=development
EXPOSE 20001
ENTRYPOINT ["sh", "./scripts/start_service.sh"]