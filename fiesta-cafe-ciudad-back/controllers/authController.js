const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta (en producción debe ir en variables de entorno .env)
const JWT_SECRET = "M1_Cl4v3_S3cr3t4_FiestaCafe";

exports.register = async (req, res) => {
    try {
        const { name, email, password, isAdult } = req.body;

        // 1. Encriptar contraseña (Seguridad)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Crear y guardar usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdult
        });
        await newUser.save();

        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // 2. Validar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Credenciales inválidas" });

        // 3. Generar JWT (Autenticación basada en tokens)
        const token = jwt.sign(
            { id: user._id, isAdult: user.isAdult }, 
            JWT_SECRET, 
            { expiresIn: '2h' } // El token expira en 2 horas
        );

        res.status(200).json({ 
            message: "Login exitoso", 
            token,
            user: { id: user._id, name: user.name, isAdult: user.isAdult }
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
};