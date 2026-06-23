const mongoose = require('mongoose');
const { Schema } = mongoose;

const articleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Article title is required.'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Article author is required.'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Article content is required.']
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);
