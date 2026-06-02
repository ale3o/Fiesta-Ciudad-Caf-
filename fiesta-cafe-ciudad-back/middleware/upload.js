const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardarán
    },
    filename: function (req, file, cb) {
        // Renombrar archivo para evitar duplicados: fecha + nombre original
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb('Error: Solo se permiten imágenes (jpeg, jpg, png, webp)');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
    fileFilter: fileFilter
});

module.exports = upload;