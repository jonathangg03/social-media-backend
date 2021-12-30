const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Auth = require('../models/auths')

passport.use(
  'local-signin',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const auth = await Auth.findOne({
          email: email
        })

        if (!auth) {
          done(false, null, { message: 'El usuario no existe' })
        }

        const validatePassword = await auth.comparePassword(password)
        if (!validatePassword) {
          done(false, null, { message: 'Contraseña incorrecta' })
        }

        const user = auth

        done(false, user)
      } catch (error) {
        done(error)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  const user = await Auth.findById(id)
  const result = {
    email: user.email,
    user: user.user
  }

  done(null, result)
})
