const passport = require('passport')
const jwt = require('jsonwebtoken')
const boom = require('@hapi/boom')
const { secret } = require('../config')

const signIn = (req, res, next) => {
  passport.authenticate('local-signin', async (err, user, info) => {
    if (err || !user) {
      const message = info ? info.message : null
      const error = `Error nuevo: ${message || 'Unknown error'}`
      throw boom.badData(error)
      // return next(error)
    }

    req.login(user, { session: false }, async (err) => {
      if (err) {
        throw boom.internal('Error interno ingresando usuario', err)
        // return next(err)
      }
      await user.populate('user')

      const payload = {
        email: user.email,
        user: user.user
      }

      const token = jwt.sign({ sub: user.id, user: payload }, secret)
      return { user: payload.user, jwt: token }
    })
  })(req, res, next)
}

module.exports = { signIn }
