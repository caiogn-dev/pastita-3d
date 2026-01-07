import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { register } from '../services/auth';

const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const Register = () => {
  const router = useRouter();
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
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

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
        router.push('/login');
      }, 2000);
    } catch (err) {
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
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card auth-success">
            <div className="auth-success-icon">OK</div>
            <h2>Conta criada!</h2>
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
            <Link href="/" className="auth-logo">PASTITA</Link>
            <p>Crie sua conta para fazer pedidos</p>
          </div>

          {errors.general && <div className="auth-error">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="João"
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Sobrenome</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Silva"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="seu@email.com"
                className={`form-input ${errors.email ? 'is-error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Celular *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="(11) 99999-9999"
                className={`form-input ${errors.phone ? 'is-error' : ''}`}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Senha *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Mínimo 8 caracteres"
                className={`form-input ${errors.password ? 'is-error' : ''}`}
              />
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          backgroundColor: i <= passwordStrength.level ? passwordStrength.color : '#e5e5e5'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    Força: {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Confirmar senha *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Digite a senha novamente"
                className={`form-input ${errors.confirmPassword ? 'is-error' : ''}`}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
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
              Já tem conta? <Link href="/login">Faça login</Link>
            </p>
          </div>
        </div>

        <Link href="/" className="auth-back">&lt; Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Register;
