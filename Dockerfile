FROM node:12 AS BUILD_IMAGE

RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY . /app

EXPOSE 3000

RUN npm install

FROM node:12-slim

WORKDIR /app

COPY --from=BUILD_IMAGE /app /app

CMD ["npm", "run", "preview"]