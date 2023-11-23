FROM node:18
WORKDIR /app

COPY . . 
RUN npm install && npm run build-docker

ENV NODE_ENV=docker

# RUN ls -lha
CMD ["node", "src/index.js" ]
# CMD ls -lha
EXPOSE 5000
