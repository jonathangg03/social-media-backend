const mongoose = require('mongoose')

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri)
    console.log('DB connected')
  } catch (error) {
    //La contraseña no debe tener caracteres especiales, sinó dará error de Uri malformado
    console.error(error.message)
  }
}

module.exports = connectDB
