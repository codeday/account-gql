FROM node:16.15 as builder
RUN apt-get -qy update && apt-get install -qy openssl
WORKDIR /app
COPY ./package.json ./yarn.lock /app/

COPY ./ /app
RUN yarn install --frozen-lockfile

RUN yarn build

FROM node:16.15-slim as runtime
RUN apt-get -qy update && apt-get install -qy openssl

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"

CMD ["yarn", "start"]
