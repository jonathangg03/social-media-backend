//Dependencies
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')

//Configurations
const { port, dbUri, secret } = require('./config')
const connectDB = require('./db')

//Routes
const users = require('./routes/users')
const auths = require('./routes/auths')
const posts = require('./routes/posts')
const path = require('path')

//Crete DB connection and Server
const app = express()
app.set('port', port)
connectDB(dbUri)
require('./auth/local')

//Config middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())

//Configure routes
app.use('/user', users)
app.use('/auth', auths)
app.use('/post', posts)
app.use('/upload', express.static(path.join(__dirname, '../uploads')))

//Port listening
app.listen(app.get('port'), () =>
  console.log(`Listen on: http://localhost:${app.get('port')}`)
)
