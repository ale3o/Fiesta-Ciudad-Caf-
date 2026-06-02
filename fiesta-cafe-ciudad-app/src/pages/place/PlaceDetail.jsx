import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Resumen');
  const [showModal, setShowModal] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTag, setSelectedTag] = useState('Buen servicio');

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/places');
        const foundPlace = response.data.find(p => p._id === id);
        setPlace(foundPlace);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchPlaceData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/places/${id}/reviews`, {
        userName: user?.name || "Usuario Anónimo",
        rating: rating,
        comment: comment,
        tags: [selectedTag]
      });
      
      setPlace(response.data);
      setShowModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      alert('Error al enviar la reseña');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgBase flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-bgBase flex flex-col items-center justify-center text-white">
        <p className="text-xl font-medium mb-4">Lugar no encontrado</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary rounded-xl text-sm">Volver al mapa</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgBase text-textMain pb-20 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white text-lg"
      >
        ←
      </button>

      <div className="w-full h-[45vh] relative">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bgBase via-bgBase/20 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-20 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 uppercase tracking-widest mb-3 inline-block">
              {place.category}
            </span>
            <h1 className="text-5xl font-bold mb-2 tracking-tight text-white">{place.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary font-bold text-lg">★ {place.rating}</span>
              <span className="text-textSec">({place.reviews?.length || 0} reseñas)</span>
              <span className={`font-medium ${place.isOpen ? 'text-success' : 'text-inactive'}`}>
                {place.isOpen ? 'Abierto ahora' : 'Cerrado'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(240,122,25,0.4)] text-white text-sm"
          >
            ★ Calificar
          </button>
        </div>

        <div className="flex gap-8 border-b border-white/10 mb-8">
          {['Resumen', 'Menú', 'Reseñas'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-textSec hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-12">
          <div className="col-span-2">
            {activeTab === 'Resumen' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 text-white">Resumen del lugar</h3>
                  <p className="text-textSec text-sm leading-relaxed">{place.description || "Sin descripción disponible."}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3 text-white">Ubicación</h3>
                  <p className="text-textSec text-sm mb-4">📍 Coordenadas registradas: {place.lat}, {place.lng} • Ciudad de México</p>
                  <div className="h-48 w-full bg-surface rounded-xl border border-white/5 flex items-center justify-center text-textSec text-xs italic">
                    Mapa de Ubicación Específica - Leaflet Active
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Menú' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface rounded-xl border border-white/5 flex justify-between text-sm">
                  <span className="text-white">Consumo Promedio General</span>
                  <span className="text-primary font-bold">$180 - $350 MXN</span>
                </div>
                <div className="p-4 bg-surface rounded-xl border border-white/5 flex justify-between text-sm">
                  <span className="text-white">Servicio de Reservación</span>
                  <span className="text-success font-bold">Disponible</span>
                </div>
              </div>
            )}

            {activeTab === 'Reseñas' && (
              <div className="space-y-4">
                {place.reviews && place.reviews.length > 0 ? (
                  place.reviews.map((rev, index) => (
                    <div key={index} className="p-5 bg-surface rounded-xl border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white">{rev.userName}</span>
                        <span className="text-primary text-xs font-semibold">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-textSec italic">"{rev.comment}"</p>
                      {rev.tags && rev.tags.map((t, i) => (
                        <span key={i} className="mt-1 self-start px-2 py-0.5 bg-white/5 text-[10px] text-textSec rounded-md border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSec italic">Este lugar aún no cuenta con opiniones. ¡Sé el primero en calificarlo!</p>
                )}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <div className="bg-surface p-6 rounded-xl border border-white/5 sticky top-24 space-y-6">
              <div>
                <h4 className="text-xs text-textSec uppercase tracking-widest mb-2">Horarios operativos</h4>
                <p className="text-sm text-white font-medium">{place.schedule || "Horario no especificado"}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs text-textSec uppercase tracking-widest mb-3">Especificaciones</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-bgBase text-[10px] text-textSec rounded-full border border-white/5">CDMX</span>
                  <span className={`px-3 py-1 text-[10px] rounded-full border ${place.ageRestricted ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-success/10 text-success border-success/20'}`}>
                    {place.ageRestricted ? '18+ Restringido' : 'Público General'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <form 
            onSubmit={handleReviewSubmit}
            className="relative z-10 w-full max-w-md p-8 glass-panel border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-2 text-center text-white">Calificar {place.name}</h2>
            <p className="text-xs text-textSec text-center mb-6">Comparte tu experiencia con la comunidad</p>
            
            <div className="flex justify-center gap-3 text-3xl mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition-colors ${star <= rating ? 'text-primary' : 'text-inactive'}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-textSec uppercase tracking-wider block mb-2">Selecciona un Tag</label>
              <div className="flex flex-wrap gap-2">
                {['Buen servicio', 'Buena música', 'Caro', 'Excelente vibra', 'Muy limpio'].map(tag => (
                  <button 
                    type="button" 
                    key={tag} 
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-[10px] border transition-all ${selectedTag === tag ? 'border-primary bg-primary/20 text-primary' : 'bg-bgBase border-white/5 text-textSec'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs text-textSec uppercase tracking-wider block mb-2">Comentario</label>
              <textarea 
                placeholder="¿Qué tal fue tu visita? Precios, ambiente, recomendaciones..."
                className="w-full h-28 bg-bgBase border border-white/5 rounded-xl p-4 text-xs text-white focus:border-primary outline-none resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-surface border border-white/10 rounded-xl text-xs font-semibold text-white"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-primary rounded-xl text-xs font-semibold text-white shadow-lg"
              >
                Publicar Reseña
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}