const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  coverPhotoUrl: String,
  coverPhotoId: String,
  description: String,
  followedPeople: Array,
  likedPost: [
    {
      type: Schema.ObjectId,
      ref: 'posts'
    }
  ],
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
