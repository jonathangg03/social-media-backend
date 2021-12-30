const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { secret } = require('../config')
const response = require('../response')

router.post('/sign-in', async (req, res, next) => {
  passport.authenticate('local-signin', async (err, user, info) => {
    try {
      if (err || !user) {
        const message = info ? info.message : null
        const error = `New error: ${message || 'Unknown error'}`
        return next(error)
      }

      req.login(user, { session: false }, async (err) => {
        if (err) return next(err)
        await user.populate('user')

        const payload = {
          email: user.email,
          user: user.user
        }

        const token = jwt.sign({ sub: user.id, user: payload }, secret)
        response.success(req, res, 200, { user: payload.user, jwt: token })
      })
    } catch (error) {
      return next(error)
    }
  })(req, res, next)
})

module.exports = router
