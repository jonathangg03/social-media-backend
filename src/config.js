if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  port: process.env.PORT,
  host: process.env.HOST,
  dbUri: process.env.DB_URI,
  secret: process.env.SECRET,
  cloudinary: {
    name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
  }
}
