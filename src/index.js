//Dependencies
const express = require('express')
const cors = require('cors')

//Configurations
const { port, dbUri } = require('./config')
const connectDB = require('./db')

//Routes
const users = require('./routes/users')
const auths = require('./routes/auths')
const posts = require('./routes/posts')

//Crete DB connection and Server
const app = express()
app.set('port', port)
connectDB(dbUri)

//Config middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Configure routes
app.use('/user', users)
app.use('/auth', auths)
app.use('/post', posts)

//Port listening
app.listen(app.get('port'), () =>
  console.log(`Listen on: http://localhost:${app.get('port')}`)
)
