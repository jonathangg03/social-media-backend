const boom = require('@hapi/boom')

const validateGetPost = ({ postId }) => {
  if (!postId) {
    throw boom.badData('No post id was sended')
  }
}

const getPost = async ({ postId, getLiked }) => {
  try {
    //Try to make validations here instead of in another function
    validateGetPost({ postId })
    let post = []
    if (!getLiked) {
      post = await Model.find({
        user: postId
      })
        .populate('user')
        .sort({ date: -1 })
      return post
    } else {
      const allPost = await Model.find().populate('user').sort({ date: -1 })
      const user = await UserModel.findById(postId)
      post = allPost.filter((posted) => {
        if (user.likedPost.includes(posted._id.toString())) {
          return posted
        }
      })
      return post
    }
  } catch (error) {
    throw boom.internal('Internal server error getting a post', error)
  }
}

module.exports = {
  getPost
}