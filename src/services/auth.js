const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')

const signIn = async () => {
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
        return { user: payload.user, jwt: token }
      })
    } catch (error) {
      return error
    }
  })(req, res, next)
}

module.exports = { signIn }
