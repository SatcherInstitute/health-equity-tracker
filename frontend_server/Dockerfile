# We use a two-stage build for the frontend. The first stage builds the frontend
# React app.
FROM node:12 AS build_react

WORKDIR /usr/src/build

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .

ARG REACT_APP_DEPLOY_CONTEXT
ENV REACT_APP_DEPLOY_CONTEXT=$REACT_APP_DEPLOY_CONTEXT
ARG REACT_APP_BASE_API_URL
ENV REACT_APP_BASE_API_URL=$REACT_APP_BASE_API_URL

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

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG DEPLOY_CONTEXT
ENV DEPLOY_CONTEXT=$DEPLOY_CONTEXT
ARG DISABLE_BASIC_AUTH
ENV DISABLE_BASIC_AUTH=$DISABLE_BASIC_AUTH
ARG BASIC_AUTH_USERNAME
ENV BASIC_AUTH_USERNAME=$BASIC_AUTH_USERNAME
ARG BASIC_AUTH_PASSWORD
ENV BASIC_AUTH_PASSWORD=$BASIC_AUTH_PASSWORD
ARG DATA_SERVER_URL
ENV DATA_SERVER_URL=$DATA_SERVER_URL

EXPOSE 8080
CMD [ "node", "server.js" ]
