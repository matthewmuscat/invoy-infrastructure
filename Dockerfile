FROM node:12

# Set the working directory to /app
WORKDIR /app 

# Volume will copy the current directory contents into the container at /app

# Install packages NPM packages
RUN yarn install

# Start Express application
CMD ["yarn", "start"]

