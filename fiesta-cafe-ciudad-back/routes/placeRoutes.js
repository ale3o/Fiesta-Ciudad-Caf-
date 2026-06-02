const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const upload = require('../middleware/upload'); // Importamos Multer para la subida de imágenes

// Ruta para poblar la BD con los lugares de prueba (mockups)
router.get('/seed', placeController.seedPlaces);

// Ruta para obtener todos los lugares
router.get('/', placeController.getPlaces);

// Ruta para añadir un nuevo lugar (usamos upload.single('image') para capturar el archivo)
router.post('/', upload.single('image'), placeController.createPlace);

// Ruta para añadir una reseña a un lugar específico
router.post('/:id/reviews', placeController.addReview);

module.exports = router;