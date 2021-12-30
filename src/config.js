if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  port: process.env.PORT,
  host: process.env.HOST,
  dbUri: process.env.DB_URI,
  secret: process.env.SECRET
}
