require("dotenv-safe").config()

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const routes = require("./routes")

mongoose.Promise = Promise
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
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
