FROM node:20-alpine

WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm install --omit=dev

COPY api-gateway/src ./src

EXPOSE 5000
CMD ["npm", "start"]
