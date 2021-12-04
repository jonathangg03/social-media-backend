const express = require('express')
const router = express.Router()
const Model = require('../models/auths')

router.get('/', async (req, res) => {
  try {
    const user = await Model.find()
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
