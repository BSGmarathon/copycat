FROM node:18-alpine as builder

WORKDIR /copycat

COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine

WORKDIR /copycat

COPY package-lock.json package.json ./
RUN npm ci --omit=dev

COPY --from=builder /copycat/build/. /copycat/

CMD ["node", "copycat.js"]

