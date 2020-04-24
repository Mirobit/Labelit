FROM node:12-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV MONGODB_URI mongodb://mongodb:27017/labelit
EXPOSE 8000
CMD [ "npm", "start" ]
