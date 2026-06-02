import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    } else {
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1920')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-panel flex flex-col items-center animate-fadeIn border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 tracking-widest text-white">
          FIESTA<span className="text-primary">•</span>CAFÉ
        </h1>
        
        <h2 className="text-xl mb-6 text-white font-medium">Inicia tu experiencia</h2>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              className={`w-full px-5 py-3.5 rounded-xl bg-surface text-white border focus:ring-2 focus:ring-primary outline-none transition-all ${error ? 'border-red-500' : 'border-white/5'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Contraseña" 
              className={`w-full px-5 py-3.5 rounded-xl bg-surface text-white border focus:ring-2 focus:ring-primary outline-none transition-all ${error ? 'border-red-500' : 'border-white/5'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-orange-600 transition-all font-bold text-white shadow-[0_0_15px_rgba(240,122,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Entrar a la ciudad"}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-sm text-textSec">
          ¿Nuevo en la ciudad? <span onClick={() => navigate('/register')} className="text-primary font-bold cursor-pointer hover:underline">Crea una cuenta</span>
        </p>
      </div>
    </div>
  );
}