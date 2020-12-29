# We use a two-stage build for the frontend. The first stage builds the frontend
# React app.
FROM node:12 AS build_react

WORKDIR /usr/src/build

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .
RUN npm run build


# Second stage: copy frontend build files from the first stage, build the server
# code, and serve the frontend using node.
FROM node:12

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./frontend_server/package*.json ./

# Install production server dependencies
RUN npm ci --only=production

# Copy frontend build files and server files
COPY ./frontend_server .
COPY --from=build_react /usr/src/build/build ./build

EXPOSE 8080
CMD [ "node", "server.js" ]
