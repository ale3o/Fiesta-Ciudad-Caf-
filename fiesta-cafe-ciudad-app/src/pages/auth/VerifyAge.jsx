import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VerifyAge() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);

  // Recuperamos los datos que el usuario llenó en la pantalla anterior
  const userData = location.state;

  // Si alguien entra directo a esta URL sin llenar sus datos, lo regresamos
  if (!userData) {
    navigate('/register');
    return null;
  }

  const handleVerify = async () => {
    setIsLoading(true);
    // isAdult = true (Mayor de edad)
    const success = await register(userData.name, userData.email, userData.password, true);
    if (success) navigate('/');
    setIsLoading(false);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    // isAdult = false (Menor de edad / Modo Seguro)
    const success = await register(userData.name, userData.email, userData.password, false);
    if (success) navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1920')] bg-cover bg-center text-textMain">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-lg p-10 glass-panel flex flex-col items-center text-center animate-fadeIn border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-white">Verificación de edad</h2>
        <p className="text-sm text-textSec mb-8">Para mostrarte los mejores lugares necesitamos verificar tu edad.</p>
        
        {/* Dropzone visual */}
        <div className="w-full h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-surface/50 mb-8 cursor-pointer hover:border-primary transition-colors group">
           <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</span>
           <h3 className="font-medium text-white">Subir INE/Identificación oficial</h3>
           <p className="text-xs text-textSec mt-2">Formatos: JPG, PNG, PDF. Máx 5MB</p>
        </div>
        
        <div className="flex gap-4 w-full">
          <button 
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-xl bg-surface border border-white/10 hover:border-white/30 transition-colors font-semibold text-white disabled:opacity-50"
          >
            Omitir
          </button>
          <button 
            onClick={handleVerify}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-orange-600 transition-all font-bold text-white shadow-[0_0_15px_rgba(240,122,25,0.3)] disabled:opacity-50"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-textSec">
          *Al omitir subir su identificación se tomará como menor de edad automáticamente.
        </p>
      </div>
    </div>
  );
}