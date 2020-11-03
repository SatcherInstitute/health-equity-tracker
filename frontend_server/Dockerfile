FROM node:12 AS build_react

WORKDIR /usr/src/build

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .
RUN npm run build



FROM node:12

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./frontend_server/package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY ./frontend_server .
COPY --from=build_react /usr/src/build/build ./build
# COPY ./frontend/build ./build

EXPOSE 8080
CMD [ "node", "server.js" ]
