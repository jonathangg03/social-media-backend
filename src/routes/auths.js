const express = require('express')
const router = express.Router()
const response = require('../response')
const { signIn } = require('../services/auth')

router.post('/sign-in', async (req, res, next) => {
  try {
    const auth = await signIn(req, res, next)
    console.log('auth: ', auth)
    response.success(req, res, 200, auth)
  } catch (error) {
    next(error)
  }
})

module.exports = router
