const mongoose = require('mongoose');

// Sub-esquema para las reseñas
const reviewSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    tags: [String]
}, { timestamps: true });

// Esquema principal de las locaciones
const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 5 },
    isOpen: { type: Boolean, default: true },
    ageRestricted: { type: Boolean, default: false },
    image: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String },
    schedule: { type: String },
    reviews: [reviewSchema] // Un lugar contiene un arreglo de reseñas
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);