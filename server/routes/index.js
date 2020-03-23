const express = require("express")
const router = express.Router()

const projectsRoutes = require("./projects")
//const categoriesRoutes = require("./categories");
//const editorRoutes = require("./editor")

router.get("/", (req, res) => {
  res.send({ hello: true })
})

router.use("/projects", projectsRoutes)
//router.use("/categories", categoriesRoutes);
//router.use("/editor", editorRoutes)

router.use((req, res) => {
  res.status(404).send({ error: "not-found" })
})

module.exports = router
