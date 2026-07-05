FROM node:20-alpine

WORKDIR /app/appointment-service

COPY appointment-service/package*.json ./
RUN npm install --omit=dev

COPY shared ../shared
COPY appointment-service/src ./src

EXPOSE 3002
CMD ["npm", "start"]
