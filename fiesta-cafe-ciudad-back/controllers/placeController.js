const Place = require('../models/Place');

// 1. Función para poblar la BD con los datos originales
exports.seedPlaces = async (req, res) => {
    const mockPlaces = [
      {
        name: "La Purísima",
        category: "Antros",
        rating: 4.1,
        isOpen: true,
        ageRestricted: true,
        image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
        lat: 19.4375,
        lng: -99.1384,
        description: "Uno de los clubes nocturnos más emblemáticos y concurridos del Centro Histórico. Famoso por su irreverente decoración kitsch y luces de neón. Ambiente de total libertad y diversidad.",
        schedule: "Jueves a Sábado: 19:00 - 03:00"
      },
      {
        name: "Cafebrería El Péndulo",
        category: "Cafetería",
        rating: 4.5,
        isOpen: true,
        ageRestricted: false,
        image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&q=80",
        lat: 19.4300,
        lng: -99.1950,
        description: "Un refugio icónico en la ciudad que combina el amor por la lectura con la gastronomía. Reconocido por su arquitectura abierta y abundante vegetación interior.",
        schedule: "Lunes a Domingo: 8:00 - 23:00"
      },
      {
        name: "Parque México",
        category: "Parque",
        rating: 4.7,
        isOpen: true,
        ageRestricted: false,
        image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80",
        lat: 19.4128,
        lng: -99.1695,
        description: "El corazón de la colonia Condesa. Extenso parque de diseño elíptico, ideal para pasear mascotas, correr o disfrutar de los andadores arbolados y el icónico Foro Lindbergh.",
        schedule: "Abierto las 24 horas"
      },
      {
        name: "Oasis Coyoacán",
        category: "Plaza",
        rating: 4.6,
        isOpen: true,
        ageRestricted: false,
        image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&q=80",
        lat: 19.3440,
        lng: -99.1740,
        description: "Centro comercial al sur de la ciudad que rompe con el formato tradicional cerrado. Destaca por su enorme lago artificial central y arquitectura abierta. Ideal para cenas y compras.",
        schedule: "Lunes a Domingo: 11:00 - 21:00"
      }
    ];

    try {
        await Place.insertMany(mockPlaces);
        res.status(201).json({ message: "¡Base de datos poblada con éxito con los lugares del mockup!" });
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al poblar la base de datos." });
    }
};

// 2. Función para obtener los lugares
exports.getPlaces = async (req, res) => {
    try {
        const places = await Place.find();
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener lugares" });
    }
};

// 3. Función para crear un nuevo lugar (¡AQUÍ CAPTURAMOS LA IMAGEN!)
exports.createPlace = async (req, res) => {
    try {
        const placeData = req.body;
        
        if (req.file) {
            // Si el usuario subió una imagen, guardamos la ruta de la carpeta uploads
            placeData.image = `uploads/${req.file.filename}`;
        } else {
            // Si por algún motivo no hay imagen, asignamos un placeholder por defecto
            placeData.image = 'https://via.placeholder.com/800x600?text=Sin+Imagen';
        }

        const newPlace = new Place(placeData);
        await newPlace.save();
        res.status(201).json(newPlace);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el lugar en la base de datos" });
    }
};

// 4. Función para guardar una reseña
exports.addReview = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ error: "Lugar no encontrado" });

        const { userName, rating, comment, tags } = req.body;
        
        place.reviews.push({ userName, rating, comment, tags });
        
        // Recalcular el promedio de estrellas
        const totalRating = place.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        place.rating = (totalRating / place.reviews.length).toFixed(1);

        await place.save();
        res.status(201).json(place);
    } catch (error) {
        res.status(500).json({ error: "Error al añadir la reseña" });
    }
};