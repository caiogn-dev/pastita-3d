import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    phone: '',
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

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Celular é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Celular inválido (10-11 dígitos)';
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
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
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

      if (err.response?.data) {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          if (key === 'email' && Array.isArray(value)) {
            backendErrors.email = value[0].includes('exists')
              ? 'Este e-mail já está cadastrado'
              : value[0];
          } else if (key === 'phone' && Array.isArray(value)) {
            backendErrors.phone = value[0].includes('exists')
              ? 'Este celular já está cadastrado'
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
            <span style={{ fontSize: '1.5rem' }}>OK</span>
          </div>
          <h2 style={{ color: 'var(--color-marsala)', marginBottom: '10px' }}>Conta criada!</h2>
          <p style={{ color: '#666' }}>Redirecionando para o login...</p>
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

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input 
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="João"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Sobrenome</label>
              <input 
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Silva"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>E-mail *</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="seu@email.com"
              style={{ ...inputStyle, borderColor: errors.email ? '#dc2626' : '#ddd' }}
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Celular *</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setFormData({ ...formData, phone: formatted });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="(11) 99999-9999"
              style={{ ...inputStyle, borderColor: errors.phone ? '#dc2626' : '#ddd' }}
            />
            {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Senha *</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
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
            <label style={labelStyle}>Confirmar senha *</label>
            <input 
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              placeholder="Digite a senha novamente"
              style={{ ...inputStyle, borderColor: errors.confirmPassword ? '#dc2626' : '#ddd' }}
            />
            {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword}</span>}
          </div>

            <button 
              type="submit" 
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'CRIAR CONTA'}
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
            Ja tem conta? <Link to="/login" style={{ color: 'var(--color-marsala)', fontWeight: 'bold', textDecoration: 'none' }}>Faca login</Link>
          </div>

          <Link to="/" className="auth-back">&lt; Voltar ao inicio</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#444'
};

const errorStyle = {
  display: 'block',
  marginTop: '6px',
  fontSize: '0.8rem',
  color: '#dc2626'
};
