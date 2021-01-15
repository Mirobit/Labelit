FROM node:14-alpine
WORKDIR /home/node
COPY --chown=node:node package*.json ./
ENV NODE_ENV=production
RUN npm ci
COPY --chown=node:node . .
EXPOSE 8000
USER node
CMD [ "node", "server/app.js" ]
