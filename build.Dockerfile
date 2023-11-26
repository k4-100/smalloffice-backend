FROM node:lts-slim as build

WORKDIR /app

COPY ./package.json .

RUN npm install 

COPY . .

RUN npm run build-docker

ENV NODE_ENV=docker


# COPY --from=build /app .

# RUN npm install --omit=dev

# CMD ["node", "src/index.js" ]

EXPOSE 5000
