FROM smalloffice-backend-build


RUN npm install --omit=dev

CMD ["node", "src/index.js" ]
