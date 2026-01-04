import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Usuário deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { level: 0, text: '', color: 'var(--color-gray-300)' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: strength, text: 'Fraca', color: 'var(--color-error)' };
    if (strength <= 3) return { level: strength, text: 'Média', color: 'var(--color-warning)' };
    return { level: strength, text: 'Forte', color: 'var(--color-success)' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      if (err.response?.data) {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (key === 'username') {
              backendErrors.username = value[0].includes('exists') ? 'Este usuário já existe' : value[0];
            } else if (key === 'email') {
              backendErrors.email = value[0].includes('exists') ? 'Este e-mail já está cadastrado' : value[0];
            } else {
              backendErrors[key] = value[0];
            }
          }
        });
        setErrors(Object.keys(backendErrors).length > 0 ? backendErrors : { general: 'Erro ao cadastrar. Tente novamente.' });
      } else {
        setErrors({ general: 'Erro ao conectar com o servidor.' });
      }
    }
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>Conta Criada!</h2>
            <p>Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">PASTITA</Link>
            <p>Crie sua conta para fazer pedidos</p>
          </div>

          {errors.general && <div className="auth-error">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-grid">
              <div className="auth-field">
                <label htmlFor="first_name">Nome</label>
                <input 
                  id="first_name"
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="João"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="last_name">Sobrenome</label>
                <input 
                  id="last_name"
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Silva"
                />
              </div>

              <div className={`auth-field full-width ${errors.username ? 'has-error' : ''}`}>
                <label htmlFor="username">Usuário *</label>
                <input 
                  id="username"
                  type="text" 
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({...formData, username: e.target.value});
                    if (errors.username) setErrors({...errors, username: ''});
                  }}
                  placeholder="seu_usuario"
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className={`auth-field full-width ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email">E-mail *</label>
                <input 
                  id="email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  placeholder="seu@email.com"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              
              <div className={`auth-field full-width ${errors.password ? 'has-error' : ''}`}>
                <label htmlFor="password">Senha *</label>
                <input 
                  id="password"
                  type="password" 
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    if (errors.password) setErrors({...errors, password: ''});
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className={errors.password ? 'input-error' : ''}
                />
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className="strength-bar"
                          style={{ backgroundColor: i <= passwordStrength.level ? passwordStrength.color : 'var(--color-gray-200)' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: passwordStrength.color }}>
                      Força: {passwordStrength.text}
                    </span>
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className={`auth-field full-width ${errors.confirmPassword ? 'has-error' : ''}`}>
                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                <input 
                  id="confirmPassword"
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({...formData, confirmPassword: e.target.value});
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                  }}
                  placeholder="Digite a senha novamente"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'CRIAR CONTA'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Já tem conta?{' '}
              <Link to="/login">Faça Login</Link>
            </p>
          </div>
        </div>

        <Link to="/" className="auth-back">← Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Register;