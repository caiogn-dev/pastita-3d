import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

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
    if (!password) return { level: 0, text: '', color: '#ccc' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: strength, text: 'Fraca', color: '#dc2626' };
    if (strength <= 3) return { level: strength, text: 'Média', color: '#d97706' };
    return { level: strength, text: 'Forte', color: '#16a34a' };
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
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      
      // Handle specific backend errors
      if (err.response?.data) {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          if (key === 'username' && Array.isArray(value)) {
            backendErrors.username = value[0].includes('exists') 
              ? 'Este usuário já existe' 
              : value[0];
          } else if (key === 'email' && Array.isArray(value)) {
            backendErrors.email = value[0].includes('exists') 
              ? 'Este e-mail já está cadastrado' 
              : value[0];
          } else if (Array.isArray(value)) {
            backendErrors[key] = value[0];
          }
        });
        
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        } else {
          setErrors({ general: 'Erro ao cadastrar. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Erro ao conectar com o servidor.' });
      }
    }
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '2rem' }}>✓</span>
          </div>
          <h2 style={{ color: 'var(--color-marsala)', marginBottom: '10px' }}>Conta Criada!</h2>
          <p style={{ color: '#666' }}>Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '450px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: 'var(--color-marsala)', margin: 0 }}>PASTITA</h1>
          </Link>
          <p style={{ color: '#666', marginTop: '10px' }}>Crie sua conta para fazer pedidos</p>
        </div>

        {errors.general && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input 
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                placeholder="João"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Sobrenome</label>
              <input 
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                placeholder="Silva"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Usuário *</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => {
                setFormData({...formData, username: e.target.value});
                if (errors.username) setErrors({...errors, username: ''});
              }}
              placeholder="seu_usuario"
              style={{ ...inputStyle, borderColor: errors.username ? '#dc2626' : '#ddd' }}
            />
            {errors.username && <span style={errorStyle}>{errors.username}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>E-mail *</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if (errors.email) setErrors({...errors, email: ''});
              }}
              placeholder="seu@email.com"
              style={{ ...inputStyle, borderColor: errors.email ? '#dc2626' : '#ddd' }}
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Senha *</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => {
                setFormData({...formData, password: e.target.value});
                if (errors.password) setErrors({...errors, password: ''});
              }}
              placeholder="Mínimo 8 caracteres"
              style={{ ...inputStyle, borderColor: errors.password ? '#dc2626' : '#ddd' }}
            />
            {formData.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      style={{ 
                        flex: 1, 
                        height: '4px', 
                        borderRadius: '2px',
                        backgroundColor: i <= passwordStrength.level ? passwordStrength.color : '#e5e5e5'
                      }} 
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: passwordStrength.color }}>
                  Força: {passwordStrength.text}
                </span>
              </div>
            )}
            {errors.password && <span style={errorStyle}>{errors.password}</span>}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Confirmar Senha *</label>
            <input 
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({...formData, confirmPassword: e.target.value});
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
              }}
              placeholder="Digite a senha novamente"
              style={{ ...inputStyle, borderColor: errors.confirmPassword ? '#dc2626' : '#ddd' }}
            />
            {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', borderRadius: '8px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'CRIAR CONTA'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--color-marsala)', fontWeight: 'bold', textDecoration: 'none' }}>Faça Login</Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #ddd', 
  fontSize: '1rem', 
  outline: 'none',
  transition: 'border-color 0.2s'
};

const labelStyle = {
  display: 'block', 
  marginBottom: '6px', 
  fontSize: '0.9rem', 
  color: '#444',
  fontWeight: '500'
};

const errorStyle = {
  display: 'block',
  marginTop: '4px',
  fontSize: '0.8rem',
  color: '#dc2626'
};

export default Register;