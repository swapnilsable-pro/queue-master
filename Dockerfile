FROM node:24 AS builder

WORKDIR /application

COPY package.json package-lock.json ./
RUN npm install
COPY . .

FROM node:24-alpine

WORKDIR /application
COPY --from=builder /application/node_modules ./node_modules
COPY --from=builder /application/package.json ./package.json
COPY --from=builder /application .

EXPOSE 3002
CMD ["npm", "start"]