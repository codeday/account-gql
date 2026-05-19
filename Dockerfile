FROM node:20-alpine3.18 AS builder
RUN apk add --no-cache openssl postgresql-client
WORKDIR /app
COPY ./package.json ./yarn.lock /app/

COPY ./ /app
RUN yarn install --frozen-lockfile

RUN yarn build
RUN mkdir -p /app/dist

FROM node:20-alpine3.18 AS runtime
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
