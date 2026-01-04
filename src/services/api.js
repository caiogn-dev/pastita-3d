import axios from 'axios';

const api = axios.create({
  // Verifique se a URL está exata (sem barra extra no final se não precisar)
  baseURL: 'https://web-production-3e83a.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // DEBUG: Veja no console do navegador se o token está sendo impresso
  console.log("Token sendo enviado:", token); 

  if (token) {
    // VOLTE PARA 'Token' AQUI. 
    // O Django padrão espera "Authorization: Token abc123..."
    config.headers.Authorization = `Token ${token}`; 
  }
  return config;
});

export default api;