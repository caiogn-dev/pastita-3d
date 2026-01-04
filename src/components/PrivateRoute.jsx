import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Caminho corrigido baseado nos seus arquivos

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Idealmente, substitua isso por um componente <LoadingSpinner />
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Carregando...
      </div>
    );
  }

  // Se existe usuário, renderiza o conteúdo da rota (Outlet)
  // Se não, redireciona para login mantendo a integridade da navegação
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;