const jwt = require('jsonwebtoken');
const JWT_SECRET = "M1_Cl4v3_S3cr3t4_FiestaCafe";

module.exports = function(req, res, next) {
    // 1. Leer el token del encabezado
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });

    try {
        // 2. Verificar el token
        const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = verified; // Añade los datos del usuario a la petición
        next(); // Permite continuar hacia el controlador
    } catch (error) {
        res.status(400).json({ error: "Token inválido o expirado." });
    }
};