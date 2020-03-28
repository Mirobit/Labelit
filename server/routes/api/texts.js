const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/:id/init', async (req, res) => {
  console.log(
    'Getting text ' +
      req.params.textid +
      ' for project ' +
      req.params.projectname
  )
  res.json({
    text: {
      id: 1,
      content:
        '.there Far far away, behind the word mountains, far from countries Vokalia the there and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the, coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.'
    },
    categories: [
      {
        keyCode: 80,
        keyString: 'P',
        name: 'Person',
        color: 'primary',
        colorHex: '#007BFF'
      },
      {
        keyCode: 87,
        keyString: 'W',
        name: 'Place',
        color: 'info',
        colorHex: '#17A2B8'
      },
      {
        keyCode: 67,
        keyString: 'C',
        name: 'Company',
        color: 'secondary',
        colorHex: '#6C757D'
      },
      {
        keyCode: 79,
        keyString: 'O',
        name: 'Other',
        color: 'dark',
        colorHex: '#343A40'
      }
    ]
  })
})

// Save edited text
router.post('/', async (req, res) => {
  console.log('body', req.body)
  res.json(true)
})

module.exports = router
