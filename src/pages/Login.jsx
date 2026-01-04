import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/cardapio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(formData.username, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Usuário ou senha inválidos');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">PASTITA</Link>
            <p>Bem-vindo de volta</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">Usuário</label>
              <input 
                id="username"
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Seu usuário"
                required
                autoFocus
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="password">Senha</label>
              <input 
                id="password"
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Sua senha"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Não tem uma conta?{' '}
              <Link to="/registro">Cadastre-se</Link>
            </p>
          </div>
        </div>

        <Link to="/" className="auth-back">← Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Login;