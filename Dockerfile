FROM node:12-alpine
WORKDIR /home/node
COPY --chown=node:node package*.json ./
RUN npm install --production && npm cache clean --force
COPY --chown=node:node . .
EXPOSE 8000
USER node
CMD [ "node", "server/app.js" ]
