const response = require('../response')

const errors = (error, req, res, next) => {
  if (error.isBoom) {
    const { output } = error
    const { payload, statusCode } = output
    response.error(req, res, statusCode, payload, payload.message)
  }

  next(error)
}

module.exports = errors
