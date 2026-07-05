FROM node:20-alpine

WORKDIR /app/auth-service

COPY auth-service/package*.json ./
RUN npm install --omit=dev

COPY shared ../shared
COPY auth-service/src ./src

EXPOSE 3001
CMD ["npm", "start"]
