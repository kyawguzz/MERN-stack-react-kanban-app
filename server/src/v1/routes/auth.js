const router = require('express').Router();
const userController = require('../controllers/user')
const { body} = require('express-validator');
const { param } = require('express-validator')
const validation = require('../handlers/validation');
const tokenHandler = require('../handlers/tokenHandlers');
const User = require('../models/user');

router.post(
    '/signup',
    body('username').isLength({ min: 4 }).withMessage(
      'username must be at least 8 characters'
    ),
    body('password').isLength({ min: 6 }).withMessage(
      'password must be at least 8 characters'
    ),
    body('confirmPassword').isLength({ min: 6 }).withMessage(
      'confirmPassword must be at least 8 characters'
    ),
    body('username').custom(value => {
      return User.findOne({ username: value }).then(user => {
        if (user) {
          return Promise.reject('username already used')
        }
      })
    }),
    validation.validate,
    userController.register
  )

router.post(
    '/login',
    body('username').isLength({ min:4 }).withMessage(
        'username must be at least 4 haracters!'
    ),
    body('password').isLength({ min:6 }).withMessage(
        'password must be at least 6 characters!'
    ),
    validation.validate,
    userController.login
)

router.post(
    '/verify-token',
    tokenHandler.verifyToken,
    (req, res) =>{
        res.status(200).json({ user: req.user})
    }
)

router.delete(
  '/:userId',
    param('userId').custom(value =>{
        if(!validation.isObjectId(value)){
            return Promise.reject('invalid id')
        }else return Promise.resolve()
    }),
    validation.validate,
    tokenHandler.verifyToken,
    userController.delete
)

module.exports = router