const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const routes = require("./routes")

const MONGODB_URI = "mongodb://localhost/lableit"

mongoose.Promise = Promise
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to Mongo!")
  })
  .catch(err => {
    console.error("Error connecting to mongo", err)
  })

const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(routes)

app.listen(8000, () => {
  console.log("Server is up and running: http://localhost:8000")
})
