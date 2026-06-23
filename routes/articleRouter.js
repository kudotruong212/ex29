const express = require('express');
const articleController = require('../controllers/articleController');
const { verifyUser } = require('../config/jwtConfig');

const articleRouter = express.Router();

articleRouter.route('/')
  .get(verifyUser, articleController.findAll)
  .post(verifyUser, articleController.create)
  .put(function (req, res) {
    res.status(403).json({ message: 'PUT operation not supported on /articles' });
  })
  .delete(verifyUser, articleController.delete);

articleRouter.route('/:id')
  .get(verifyUser, articleController.findById)
  .post(verifyUser, function (req, res) {
    res.status(403).json({
      message: `POST operation not supported on /articles/${req.params.id}`
    });
  })
  .put(verifyUser, articleController.update)
  .delete(verifyUser, articleController.delete);

module.exports = articleRouter;
