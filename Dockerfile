FROM node:20-alpine

# Create application directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install production dependencies only to keep the image lightweight (important for Cloud Run cold starts)
RUN npm install --omit=dev

# Bundle app source
COPY . .

# The application MUST listen on the port defined by the $PORT environment variable.
# Cloud Run sets this automatically, but we define a default just in case.
ENV PORT=8080
EXPOSE 8080

# Start the Node.js server
CMD [ "npm", "start" ]
