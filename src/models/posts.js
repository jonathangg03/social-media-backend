const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  imageUrl: String,
  imageId: String,
  likes: Array,
  user: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  date: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('posts', UserSchema)
