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

const getFollowedPeoplePosts = async ({ userId }) => {
  if (!userId) {
    throw boom.badData('User not specified')
  } else {
    const userPost = await PostModel.find().populate('user').sort({ date: -1 })
    const user = await UserModel.findById(userId)

    const postToShow = userPost.filter((post) => {
      if (user.followedPeople.includes(post.user._id)) {
        return post
      }
    })
    return postToShow
  }
}

const createPost = async ({ userId, file, content }) => {
  if (!userId) {
    throw boom.internal('No user was specified')
  } else {
    let imageUrl = ''
    let imageId = ''
    if (file) {
      const { filename } = file
      const fileDirection = `${__dirname}/../../uploads/${filename}`
      const cloudUpload = await cloudinary.v2.uploader.upload(fileDirection)
      imageUrl = cloudUpload.url
      imageId = cloudUpload.public_id

      fs.unlink(fileDirection, (error) => {
        if (error) {
          throw boom.internal('FS error deleting image from the server', error)
        } else {
          console.log('Post image deleted from server')
        }
      })
    }

    const newPost = new PostModel({
      content: content,
      imageUrl: imageUrl,
      imageId: imageId,
      likes: [],
      user: userId,
      date: Date.now()
    })
    await newPost.save()
    return newPost
  }
}

module.exports = {
  getPost,
  getFollowedPeoplePosts,
  createPost
}
