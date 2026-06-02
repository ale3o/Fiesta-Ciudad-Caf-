import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix para los íconos de Leaflet en React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente para mover la cámara del mapa
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados de Interfaz
  const [activeView, setActiveView] = useState('Mapa');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [mapCenter, setMapCenter] = useState([19.4326, -99.1332]); // Centro en CDMX por defecto
  
  // Estado para la Base de Datos
  const [places, setPlaces] = useState([]);

  // Estados para el Formulario de Añadir Lugar
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // --- CAMBIO: image ahora guarda el ARCHIVO, no texto ---
  const [newPlace, setNewPlace] = useState({
    name: '', category: 'Cafetería', image: null, address: '', description: '', schedule: ''
  });
  // Estado para previsualizar la foto antes de subirla
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar los lugares desde el Backend (MongoDB)
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/places');
        setPlaces(response.data);
      } catch (error) {
        console.error("Error al cargar locaciones desde la BD", error);
      }
    };
    fetchPlaces();
  }, []);

  // Filtros y Reglas de Negocio (Modo Seguro)
  const availablePlaces = places.filter(place => 
    user?.isAdult ? true : !place.ageRestricted
  );

  const displayedPlaces = activeFilter === 'Todos' 
    ? availablePlaces 
    : availablePlaces.filter(p => p.category === activeFilter);

  // Funciones de Navegación
  const handleMapCardClick = (place) => {
    setMapCenter([place.lat, place.lng]);
  };

  const goToDetail = (id) => {
    navigate(`/place/${id}`);
  };

  // --- CAMBIO: Manejar selección de archivo ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewPlace({...newPlace, image: file});
        // Crear URL temporal para previsualización visual
        setImagePreview(URL.createObjectURL(file));
    }
  };

  // Función de Guardado + GEOCODIFICACIÓN + SUBIDA DE FOTO
  const handleAddPlaceSubmit = async (e) => {
    e.preventDefault();
    setIsLocating(true);

    try {
      // 1. Geocodificación (convertir dirección a coordenadas)
      const geocodeRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newPlace.address)}`);
      
      if (geocodeRes.data.length === 0) {
        alert('No pudimos localizar esa dirección. Intenta agregar ciudad o CP (ej: "Roma Norte, CDMX").');
        setIsLocating(false);
        return;
      }

      const foundLat = parseFloat(geocodeRes.data[0].lat);
      const foundLng = parseFloat(geocodeRes.data[0].lon);

      // --- CAMBIO CLAVE: Usar FormData para enviar archivo + texto ---
      const formData = new FormData();
      formData.append('name', newPlace.name);
      formData.append('category', newPlace.category);
      formData.append('address', newPlace.address);
      formData.append('description', newPlace.description);
      formData.append('schedule', newPlace.schedule);
      formData.append('lat', foundLat);
      formData.append('lng', foundLng);
      formData.append('ageRestricted', newPlace.category === 'Antros' || newPlace.category === 'Bares');
      
      // Adjuntar el archivo real
      if (newPlace.image) {
          formData.append('image', newPlace.image);
      }

      // 2. Guardar en MongoDB enviando FormData (importante cambiar headers)
      await axios.post('http://localhost:5000/api/places', formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

      alert('¡Lugar localizado y registrado con éxito en la base de datos!');
      setShowAddPlace(false);
      // Limpiar estados
      setNewPlace({ name: '', category: 'Cafetería', image: null, address: '', description: '', schedule: '' });
      setImagePreview(null);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert('Error al intentar registrar el lugar.');
    } finally {
      setIsLocating(false);
    }
  };

  // --- FUNCIÓN AUXILIAR PARA RENDERIZAR IMÁGENES ---
  // Decide si usar la URL directa (mockups) o el servidor local (subidas)
  const renderPlaceImage = (imagePath) => {
      if (!imagePath) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
      
      if (imagePath.startsWith('http')) {
          return imagePath; // URL externa (Unsplash, etc.)
      }
      return `http://localhost:5000/${imagePath}`; // Imagen subida localmente
  };

  return (
    <div className="flex h-screen bg-bgBase overflow-hidden text-textMain">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-80 bg-surface flex flex-col p-6 border-r border-white/5 z-[1000] relative shadow-2xl">
        <h2 className="text-primary text-2xl font-bold mb-6 tracking-widest uppercase">FIESTA<span className="text-white">•</span>CAFÉ</h2>
        
        <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 border transition-colors ${user?.isAdult ? 'border-success/30 bg-success/10' : 'border-red-500/30 bg-red-500/10'}`}>
          <div className={`w-3 h-3 rounded-full ${user?.isAdult ? 'bg-success' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
          <div>
            <p className="font-semibold text-sm">{user?.isAdult ? 'Acceso Completo' : 'Modo Seguro'}</p>
            <p className="text-[10px] text-textSec uppercase tracking-widest">{user?.isAdult ? 'Verificado' : '18+ Restringido'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['Bares', 'Antros', 'Cafetería', 'Parque', 'Plaza'].map(cat => {
            const isRestricted = !user?.isAdult && (cat === 'Bares' || cat === 'Antros');
            return (
              <button 
                key={cat}
                disabled={isRestricted}
                onClick={() => setActiveFilter(activeFilter === cat ? 'Todos' : cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300
                  ${isRestricted ? 'opacity-30 cursor-not-allowed border-inactive bg-bgBase' : 
                    activeFilter === cat ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-textSec hover:border-primary bg-surface'}`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <nav className="flex flex-col gap-3 mb-auto font-medium">
          <button onClick={() => setActiveView('Mapa')} className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeView === 'Mapa' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textSec hover:text-white border border-transparent'}`}>
            📍 Vista Mapa
          </button>
          <button onClick={() => setActiveView('Feed')} className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeView === 'Feed' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textSec hover:text-white border border-transparent'}`}>
            📱 Explorar Feed
          </button>
          
          <div className="h-px w-full bg-white/5 my-2"></div>
          
          <button 
            onClick={() => setShowAddPlace(true)} 
            className="w-full mt-2 p-3 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>+</span> Añadir Nuevo Lugar
          </button>
        </nav>

        <button onClick={logout} className="mt-6 p-3 text-sm font-medium text-textSec hover:text-white transition-colors border-t border-white/5 flex items-center justify-center gap-2">
          Cerrar sesión
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 relative bg-bgBase">
        <header className="absolute top-0 w-full h-20 bg-surface/80 backdrop-blur-md border-b border-white/5 z-[1000] flex items-center justify-between px-10 shadow-lg">
           <input type="text" placeholder="Buscar lugares, cafés o antros..." className="bg-bgBase border border-white/10 rounded-full px-6 py-2.5 w-96 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-textSec" />
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-textSec hidden md:block">Hola, {user?.name || 'Usuario'}</span>
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-primary shadow-[0_0_10px_rgba(240,122,25,0.2)]">
                {user?.name?.charAt(0) || 'U'}
              </div>
           </div>
        </header>

        <div className="h-full w-full pt-0">
          {activeView === 'Mapa' ? (
            <div className="h-full w-full z-0 relative">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                <ChangeView center={mapCenter} />
                
                {displayedPlaces.map(place => (
                  <Marker key={place._id} position={[place.lat, place.lng]}>
                    <Popup className="custom-popup">
                      <div className="text-black font-sans min-w-[150px]">
                        <strong className="text-lg block mb-1">{place.name}</strong>
                        <span className="text-primary font-bold block mb-3">★ {place.rating}</span>
                        <button 
                          onClick={() => goToDetail(place._id)}
                          className="w-full bg-primary text-white font-semibold px-4 py-2 rounded-lg text-xs hover:bg-orange-600 transition-colors shadow-md"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div className="absolute bottom-8 left-0 right-0 px-10 z-[1000] flex gap-5 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {displayedPlaces.map(place => (
                  <div 
                    key={place._id} 
                    onClick={() => handleMapCardClick(place)}
                    className="min-w-[320px] snap-center glass-panel p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 flex gap-4 items-center group shadow-2xl"
                  >
                    {/* --- CAMBIO: Usar función auxiliar para imagen --- */}
                    <img src={renderPlaceImage(place.image)} alt={place.name} className="w-24 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform" />
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{place.name}</h4>
                      <p className="text-[10px] text-textSec uppercase tracking-widest mb-2 bg-white/5 inline-block px-2 py-0.5 rounded-md border border-white/5">{place.category}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-primary text-xs font-bold">★ {place.rating}</span>
                         <span className="text-[10px] text-textSec">({place.reviews?.length || 0})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-28 px-10 h-full overflow-y-auto custom-scrollbar bg-bgBase">
              <h3 className="text-3xl font-bold mb-8 text-white tracking-tight">Explorar en la Ciudad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {displayedPlaces.map(place => (
                  <div 
                    key={place._id} 
                    onClick={() => goToDetail(place._id)}
                    className="bg-surface rounded-2xl overflow-hidden border border-white/5 group hover:border-primary/50 transition-all cursor-pointer shadow-lg hover:shadow-primary/10 flex flex-col h-full"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {/* --- CAMBIO: Usar función auxiliar para imagen --- */}
                      <img src={renderPlaceImage(place.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={place.name} />
                      
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                        <span className="text-primary text-xs font-bold">★</span>
                        <span className="text-white text-xs font-medium">{place.rating}</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-[10px] text-textSec uppercase tracking-widest mb-1">{place.category}</p>
                      <h4 className="text-lg font-bold mb-2 text-white line-clamp-1">{place.name}</h4>
                      <p className="text-xs text-textSec line-clamp-2 mb-4 flex-1">{place.description || "Descubre más sobre este increíble lugar..."}</p>
                      <button className="w-full py-2.5 rounded-xl border border-white/10 text-white text-xs font-semibold group-hover:bg-primary group-hover:border-primary transition-colors">
                        Ver Detalles completos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PARA AÑADIR NUEVO LUGAR */}
      {showAddPlace && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddPlace(false)}></div>
          
          <form 
            onSubmit={handleAddPlaceSubmit}
            className="relative z-10 w-full max-w-lg p-8 glass-panel border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleIn shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Registrar Locación</h2>
              <button type="button" onClick={() => setShowAddPlace(false)} className="text-textSec hover:text-white text-xl">&times;</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Nombre del Lugar</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-bgBase text-white border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Categoría</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-bgBase text-white border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all appearance-none"
                  value={newPlace.category}
                  onChange={(e) => setNewPlace({...newPlace, category: e.target.value})}
                >
                  <option value="Cafetería">Cafetería</option>
                  <option value="Bares">Bar</option>
                  <option value="Antros">Antro</option>
                  <option value="Parque">Parque</option>
                  <option value="Plaza">Plaza</option>
                </select>
              </div>

              {/* --- CAMBIO: Input de archivo con previsualización --- */}
              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Fotografía del Lugar</label>
                
                <div className="flex items-center gap-4">
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                    )}
                    <label className="flex-1 cursor-pointer group">
                        <div className="w-full px-4 py-3 rounded-xl bg-bgBase text-textSec border border-dashed border-white/10 group-hover:border-primary group-hover:text-primary transition-all text-sm text-center">
                            {newPlace.image ? newPlace.image.name : 'Seleccionar foto...'}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          required
                        />
                    </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Dirección Física</label>
                <input 
                  type="text" 
                  placeholder="Ej: República de Cuba 17, Centro, CDMX"
                  className="w-full px-4 py-3 rounded-xl bg-bgBase text-white border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({...newPlace, address: e.target.value})}
                  required
                />
                <p className="text-[10px] text-primary mt-2 flex items-center gap-1 font-medium">
                  <span>📍</span> Localizaremos las coordenadas automáticamente.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Descripción y Vibra</label>
                <textarea 
                  placeholder="Describe la experiencia del lugar..."
                  className="w-full h-24 p-4 rounded-xl bg-bgBase text-white border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none custom-scrollbar transition-all"
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({...newPlace, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] text-textSec uppercase tracking-widest block mb-2 font-medium">Horarios Operativos</label>
                <input 
                  type="text" 
                  placeholder="Ej: Jueves a Sábado: 19:00 - 03:00"
                  className="w-full px-4 py-3 rounded-xl bg-bgBase text-white border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  value={newPlace.schedule}
                  onChange={(e) => setNewPlace({...newPlace, schedule: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setShowAddPlace(false)}
                className="flex-1 py-3.5 rounded-xl bg-surface border border-white/10 hover:border-white/30 text-white font-semibold transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLocating}
                className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(240,122,25,0.4)] text-sm disabled:opacity-50 flex justify-center items-center"
              >
                {isLocating ? 'Procesando...' : 'Guardar Lugar'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}