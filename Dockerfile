# syntax=docker/dockerfile:1.4

FROM node:20.9.0

# Set working directory
WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Same as npm install
RUN npm ci

COPY . /app


ENV CI=true
ENV PORT=3000

ENV VITE_DOCKER=true;

EXPOSE 7058

CMD [ "npm", "run", "start" ]