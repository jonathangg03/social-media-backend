const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  coverPhotoUrl: String,
  coverPhotoId: String,
  description: String,
  followedPeople: [
    {
      type: Schema.ObjectId,
      ref: 'users'
    }
  ],
  likedPost: Array,
  name: {
    type: String,
    required: true
  },
  profilePhotoUrl: String,
  profilePhotoId: String
})

UserSchema.methods.hashPassword = (password) => {
  return bcrypt.hash(password, 10)
}

module.exports = mongoose.model('users', UserSchema)
