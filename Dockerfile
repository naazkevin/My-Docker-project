FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VERSION
ENV VERSION=$VERSION

EXPOSE 3000

CMD ["sh", "-c", "VERSION=$VERSION node server.js"]