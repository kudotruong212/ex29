const express = require('express');
const userController = require('../controllers/userController');
const { verifyUser } = require('../config/jwtConfig');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/me', verifyUser, userController.me);

module.exports = router;
