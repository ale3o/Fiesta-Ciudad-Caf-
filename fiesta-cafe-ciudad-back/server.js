const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Necesario para configurar las rutas de las carpetas

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes'); 

const app = express();

app.use(express.json()); 
app.use(cors()); 

// Hacer que la carpeta "uploads" sea de acceso público para poder ver las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡El Backend de FIESTA • CAFÉ • CIUDAD está vivo y funcionando! 🚀');
});

// Conexión a MongoDB Atlas (Asegúrate de poner tu URL real si la cambiaste)
const MONGO_URI = 'mongodb+srv://admin:1234@admin.unozqbh.mongodb.net/?appName=admin';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Base de datos conectada en la nube'))
  .catch(err => console.log('❌ Error al conectar BD:', err));

// Uso de Rutas
app.use('/api/auth', authRoutes);         
app.use('/api/places', placeRoutes);      

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en el puerto ${PORT}`);
});