# We use a two-stage build for the frontend. The first stage builds the frontend
# React app.
FROM node:20.11.0 AS build_react
ARG DEPLOY_CONTEXT

WORKDIR /usr/src/build

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .

ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build:$DEPLOY_CONTEXT

# Second stage: copy frontend build files from the first stage, build the server
# code, and serve the frontend using node.
FROM node:20.11.0
ARG DEPLOY_CONTEXT
ENV DEPLOY_CONTEXT=$DEPLOY_CONTEXT
ARG AHR_API_KEY
ENV AHR_API_KEY=$AHR_API_KEY
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

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
CMD node -r dotenv/config server.js dotenv_config_path=.env.$DEPLOY_CONTEXT
