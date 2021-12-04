const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
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

module.exports = mongoose.model('auths', UserSchema)
