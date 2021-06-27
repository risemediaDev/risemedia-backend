const { body, validationResult, check } = require('express-validator');

const getArticleValidationRules = () => {
    return [
        body('page').optional().isInt({gt: 1}), 
        body('criteria').optional().notEmpty(),
        body('articleId').optional().not().isEmpty(),
        body('locationId').optional().not().isEmpty(),
    ]
};

const createArticleValidationRules = () => {
    return [
        body('title').notEmpty().isString().trim(),
        body('content').notEmpty().isString().escape(),
        body('keywords').optional().isArray(),
        check('keywords.*').notEmpty().isString(),
        body('descText').notEmpty().isString().trim(),
        body('location').notEmpty().isMongoId(),
        body('author').optional().isMongoId(),
        body('categoryId').notEmpty().isMongoId()
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
    validate,
    getArticleValidationRules,
    createArticleValidationRules,
    
}