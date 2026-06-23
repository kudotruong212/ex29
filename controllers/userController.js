const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret } = require('../config/jwtConfig');

function createToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username
    },
    jwtSecret,
    { expiresIn: '1h' }
  );
}

async function signup(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = createToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user);
    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.status(200).json(req.user);
}

module.exports = {
  signup,
  login,
  me
};
