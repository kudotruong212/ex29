const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true
  },
  password: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'facebook', 'google', 'multiple'],
    default: 'local'
  },
  providers: {
    type: [String],
    enum: ['local', 'facebook', 'google'],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
