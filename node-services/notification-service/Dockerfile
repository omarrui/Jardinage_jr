FROM node:20-alpine

WORKDIR /app

COPY notification-service/package*.json ./
RUN npm install --omit=dev

COPY notification-service/src ./src

EXPOSE 3003
CMD ["npm", "start"]
