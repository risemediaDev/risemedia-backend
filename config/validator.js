const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
  return [
    // username must be an email
    body('username').isEmail(),
    // password must be at least 8 chars long
    body('password').isLength({ min: 8 }),
  ]
};

const getArticleValidationRules = () => {
    return [
        body('page').optional().isInt({gt: 1}), 
        body('criteria').optional().notEmpty(),
        body('articleId').optional().not().isEmpty(),
        body('locationId').optional().not().isEmpty(),
    ]
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
    getArticleValidationRules,
    userValidationRules,
    validate,
}