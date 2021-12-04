const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  coverPhotoUrl: String,
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
  profilePhotoUrl: String
})

module.exports = mongoose.model('users', UserSchema)
