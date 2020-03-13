const express = require("express")
const path = require("path")
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload")
const routes = require("./routes")

const MONGODB_URI = 'mongodb://localhost/lableit'


mongoose.Promise = Promise;
mongoose
  .connect(MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const server = express()
server.use(fileUpload())
server.use(express.static(path.join(__dirname, "public")))
server.use(routes)

server.listen(8000, () => {
  console.log("Server is up and running: http://localhost:8000")
});