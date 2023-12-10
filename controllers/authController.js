const User = require('../models/userModal')
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res) => {

  const { username, password } = req.body

  try {
    const hashpassword = await bcrypt.hash(password, 12)
    const newUser = await User.create({
      username,
      password: hashpassword
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail'
    })
    console.log(error)
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    const isCorrect = await bcrypt.compare(password, user.password);
    if (isCorrect) {
      res.status(200).json({
        status: 'success',
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Incorrect username or password',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
    console.error(error);
  }
};