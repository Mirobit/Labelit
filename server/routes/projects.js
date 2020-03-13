const express = require("express")
const router = express.Router()
const Project = require("../models/Project")

router.get("/", (req, res) => {
    Project.find({}).then(projects => {
        res.send({ result: projects })
    })
})

router.post("/", (req, res) => {
    console.log("body", req.body)
    new Project({
      title: req.body.title,
      content: req.body.content,
      to: req.body.to,
      from: req.user._id,
      date: Date.now()
    })
      .save()
      .then(result => {
        console.log("message saved in db")
        res.send({ result: true })
      })
      .catch(error => {
        console.log(error)
        res.send({ result: false })
      })
  })

  router.delete("/:id", (req, res) => {
    Project.deleteOne({ _id: req.params.id })
      .then(result => {
        res.send(true)
      })
      .catch(error => {
        console.log(error)
        res.send(false)
      })
  })

// router.post("/update", (req, res) => {
//   console.log("incoming", req.body.data);
//   const newData = {
//     name: req.body.data.name,
//     age: req.body.data.age,
//     description: req.body.data.description,
//     skills: req.body.data.skills,
//     gender: req.body.data.gender,
//     available: req.body.data.available
//   };
//   User.findOneAndUpdate({ _id: req.user._id }, newData, { new: true, runValidators: true })
//     .then(result => {
//       console.log(result);
//       console.log("profile updated");
//       res.send({ result: true });
//     })
//     .catch(error => {
//       console.log(error);
//       res.send({ result: false });
//     });
// });

module.exports = router