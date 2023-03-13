const express = require('express')
const router = express.Router()
const response = require('../response')
const signIn = require('../services/auth/signIn')

router.post('/sign-in', async (req, res, next) => {
  try {
    const auth = await signIn()
    response.success(req, res, 200, auth)
  } catch (error) {
    response.error(req, res, 500, 'Internal error authenticating user', error)
  }
})

module.exports = router
