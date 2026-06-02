import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    dob: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Unimos los nombres para guardarlo en la base de datos
    const fullName = `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim();

    // Navegamos a la verificación de edad PASÁNDOLE los datos reales
    navigate('/verify-age', {
      state: {
        name: fullName,
        email: formData.email,
        password: formData.password
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1920')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-panel border border-white/10 shadow-2xl animate-scaleIn">
        <div className="text-center mb-6">
           <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-1">FIESTA • CAFÉ • CIUDAD</h2>
           <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input 
            type="text" 
            placeholder="Nombres" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-white border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.nombres}
            onChange={(e) => setFormData({...formData, nombres: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="Apellido Paterno" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-white border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.apellidoPaterno}
            onChange={(e) => setFormData({...formData, apellidoPaterno: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="Apellido Materno" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-white border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.apellidoMaterno}
            onChange={(e) => setFormData({...formData, apellidoMaterno: e.target.value})}
          />
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-white border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-white border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <input 
            type="date" 
            className="w-full px-5 py-3 rounded-xl bg-surface text-textSec border border-white/5 focus:border-primary outline-none text-sm"
            value={formData.dob}
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
            required
          />
          
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-orange-600 transition-all font-bold text-white shadow-[0_0_15px_rgba(240,122,25,0.3)]"
            >
              Continuar
            </button>
          </div>
        </form>
        
        <p className="mt-6 text-sm text-center text-textSec">
          ¿Ya tienes cuenta? <span onClick={() => navigate('/login')} className="text-primary font-bold cursor-pointer hover:underline">Inicia sesión</span>
        </p>
      </div>
    </div>
  );
}