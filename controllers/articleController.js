const Article = require('../models/article');

async function findAll(req, res, next) {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
}

async function findById(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json({ message: 'Article deleted successfully', article });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: remove
};
