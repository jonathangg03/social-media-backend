const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const AuthSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'users'
  }
})

AuthSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password) //Como usamos this, no usamos AF
}

module.exports = mongoose.model('auths', AuthSchema)
