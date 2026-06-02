import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Al cargar la página, revisa si ya hay un token guardado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Función REAL para hacer Login conectada al Backend
  const login = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        
        // Si es exitoso, guardamos el token y los datos
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        return true;
    } catch (error) {
        console.error("Error al iniciar sesión:", error.response?.data?.error);
        alert(error.response?.data?.error || "Error al iniciar sesión");
        return false;
    }
  };

  // Función REAL para Registrar conectada al Backend
  const register = async (name, email, password, isAdult) => {
    try {
        await axios.post('http://localhost:5000/api/auth/register', { name, email, password, isAdult });
        // Si el registro es exitoso, iniciamos sesión automáticamente
        await login(email, password);
        return true;
    } catch (error) {
        console.error("Error en registro:", error.response?.data?.error);
        alert(error.response?.data?.error || "Error al registrar");
        return false;
    }
  };

  // Función auxiliar para cuando el usuario omite subir el INE
  const registerAsMinor = async () => {
    const randomNum = Math.floor(Math.random() * 1000);
    // Registra un usuario anónimo menor de edad en la base de datos
    await register("Usuario Joven", `menor${randomNum}@test.com`, "123456", false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, registerAsMinor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);