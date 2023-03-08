const boom = require('@hapi/boom')
const PostModel = require('../models/posts')
const UserModel = require('../models/users')

const getPost = async ({ userId, getLiked }) => {
  try {
    let post = []
    if (!getLiked) {
      post = await PostModel.find({
        user: userId
      })
        .populate('user')
        .sort({ date: -1 })
    } else {
      const allPost = await PostModel.find().populate('user').sort({ date: -1 })
      const user = await UserModel.findById(userId)
      post = allPost.filter((posted) => {
        if (user.likedPost.includes(posted._id.toString())) {
          return posted
        }
      })
    }
    return post
  } catch (error) {
    throw boom.internal('Internal server error getting a post', error)
  }
}

module.exports = {
  getPost
}
