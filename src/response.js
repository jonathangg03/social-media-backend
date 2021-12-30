exports.success = (req, res, code, body) => {
  res.status(code).send({
    statusCode: code,
    body
  })
}

exports.error = (req, res, code, body, message) => {
  console.error(message || body)
  res.status(code).send({
    statusCode: code,
    error: body
  })
}
