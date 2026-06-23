require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Article = require('./models/article');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newspapers';

async function seed() {
  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB successfully');

  await User.deleteMany({});
  await Article.deleteMany({});

  const password = await bcrypt.hash('123', 10);
  await User.create({
    username: 'Danh123',
    password
  });

  await Article.insertMany([
    {
      title: 'Exploring the Hidden Gems of Paris',
      author: 'Jane Doe',
      content: 'Paris is known for its iconic landmarks like the Eiffel Tower and Louvre.',
      tags: ['Travel']
    },
    {
      title: 'The Evolution of Web Development',
      author: 'John Smith',
      content: 'Web development has significantly evolved over the past few decades.',
      tags: ['Technology']
    }
  ]);

  console.log('Seed completed. Login with username "Danh123" and password "123".');
  await mongoose.disconnect();
}

seed().catch(async function (err) {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
