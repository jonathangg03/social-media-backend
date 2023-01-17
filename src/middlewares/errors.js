const response = require('../response')

const errors = (error, req, res, next) => {
  console.log('Enter boom 1')

  if (error.isBoom) {
    const { output } = error
    const { payload, statusCode } = output

    console.log('Enter boom 2')

    response.error(req, res, statusCode, payload, payload.message)
  }

  console.log('Error detected: ', error)
  next()
}

module.exports = errors
