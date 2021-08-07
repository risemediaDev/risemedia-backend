const { body, validationResult, check } = require('express-validator');

const validatePasswordReset = () => {
    return [
        body('email').notEmpty().isEmail()    ]
};


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
    validate,
    validatePasswordReset,
}