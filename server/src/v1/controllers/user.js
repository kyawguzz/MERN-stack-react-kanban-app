const User = require('../models/user')
const CryptoJS = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken')
const Board = require('../models/board')
const Section = require('../models/section');
const Task = require('../models/task'); 

exports.register = async (req, res) => {
  const { password } = req.body
  try {
    req.body.password = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    )

    const user = await User.create(req.body)
    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username }).select('password username')
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8)

    if (decryptedPass !== password) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    user.password = undefined

    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )

    res.status(200).json({ user, token })

  } catch (err) {
    res.status(500).json(err)
  }
}

exports.delete = async(req, res) =>{
  const {userId} = req.params;
  try{
      const board = await Board.find({user: userId})
      for (var i = 0; i < board.length; i++) {
        board.map(async b => {
          const section = await Section.find({ board: b._id })
          for (var a = 0; a < section.length; a++) {
            section.map(async s => {
              await Task.deleteMany({ section: s._id })
            })
           }
         await Section.deleteMany({ board: b._id })
        })
       }
      await Board.deleteMany({ user: userId})
      await User.deleteOne({_id: userId});

      res.status(200).json('deleted')
  }catch(err){
      res.status(500).json(err)
  }
}