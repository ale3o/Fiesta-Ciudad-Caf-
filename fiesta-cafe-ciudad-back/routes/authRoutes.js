const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definición de Endpoints REST
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;