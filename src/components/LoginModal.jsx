/**
 * Login Modal with WhatsApp authentication option
 * 
 * Shows two login options:
 * 1. WhatsApp OTP (primary, recommended)
 * 2. Traditional email/password
 */
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { sendWhatsAppCode, verifyWhatsAppCode, resendWhatsAppCode } from '../services/auth';

const WHATSAPP_ACCOUNT_ID = process.env.NEXT_PUBLIC_WHATSAPP_ACCOUNT_ID || '';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, signInWithWhatsApp } = useAuth();
  
  // Login method: 'choice' | 'whatsapp' | 'email'
  const [loginMethod, setLoginMethod] = useState('choice');
  
  // WhatsApp state
  const [step, setStep] = useState('phone'); // 'phone' | 'code' | 'success'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const inputRefs = useRef([]);
  
  // Email state
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  // Common state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setLoginMethod('choice');
      setStep('phone');
      setPhone('');
      setCode(['', '', '', '', '', '']);
      setFormData({ username: '', password: '' });
      setError('');
      setCountdown(0);
      setRemainingAttempts(3);
      setLoading(false);
    }
  }, [isOpen]);

  // Focus first code input
  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  if (!isOpen) return null;

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // ===== WhatsApp Methods =====
  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const result = await sendWhatsAppCode(`+${fullPhone}`, WHATSAPP_ACCOUNT_ID);
      
      if (result.success) {
        setStep('code');
        setCountdown(60);
      } else {
        setError(result.message || 'Erro ao enviar código');
        if (result.retry_after) {
          setCountdown(result.retry_after);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const result = await resendWhatsAppCode(`+${fullPhone}`, WHATSAPP_ACCOUNT_ID);
      
      if (result.success) {
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
      } else {
        setError(result.message || 'Erro ao reenviar código');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao reenviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const result = await verifyWhatsAppCode(`+${fullPhone}`, fullCode);
      
      if (result.valid) {
        setStep('success');
        await signInWithWhatsApp(result.user);
        
        setTimeout(() => {
          if (onSuccess) onSuccess(result.user);
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Código inválido');
        if (result.remaining_attempts !== undefined) {
          setRemainingAttempts(result.remaining_attempts);
        }
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('');
      if (fullCode.length === 6) {
        setTimeout(() => handleVerifyCode(), 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ===== Email Methods =====
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(formData.username, formData.password);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'Usuário ou senha inválidos');
    }
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ===== Render Choice Screen =====
  if (loginMethod === 'choice') {
    return (
      <div className="login-modal-overlay" onClick={handleOverlayClick}>
        <div className="login-modal">
          <button className="login-modal-close" onClick={onClose}>×</button>

          <div className="login-modal-header">
            <h2>Faça login</h2>
            <p>Entre para adicionar produtos ao carrinho</p>
          </div>

          <div className="login-modal-choices">
            {/* WhatsApp Button - Primary */}
            <button 
              className="btn-whatsapp-login"
              onClick={() => setLoginMethod('whatsapp')}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Entrar com WhatsApp
            </button>

            <div className="login-modal-divider">
              <span>ou</span>
            </div>

            {/* Email Button - Secondary */}
            <button 
              className="btn-email-login"
              onClick={() => setLoginMethod('email')}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Entrar com E-mail e Senha
            </button>
          </div>

          <div className="login-modal-footer">
            <p>
              Não tem conta?{' '}
              <Link href="/registro" onClick={onClose}>Cadastre-se</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render WhatsApp Login =====
  if (loginMethod === 'whatsapp') {
    return (
      <div className="login-modal-overlay" onClick={handleOverlayClick}>
        <div className="login-modal">
          <button className="login-modal-close" onClick={onClose}>×</button>
          
          <div className="login-modal-header">
            <div className="whatsapp-icon">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h2>Login com WhatsApp</h2>
          </div>

          {error && <div className="login-modal-error">{error}</div>}

          {step === 'phone' && (
            <div className="login-modal-content">
              <p className="login-modal-description">
                Digite seu número de WhatsApp para receber um código de verificação
              </p>
              
              <div className="login-modal-field">
                <label>Número de WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  autoFocus
                />
              </div>
              
              <button
                onClick={handleSendCode}
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="btn-primary login-modal-submit"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
              
              <button 
                className="btn-link btn-back"
                onClick={() => setLoginMethod('choice')}
              >
                ← Voltar
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="login-modal-content">
              <p className="login-modal-description">
                Digite o código de 6 dígitos enviado para
              </p>
              <p className="phone-display">{phone}</p>
              
              <div className="code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="code-input"
                    maxLength={1}
                  />
                ))}
              </div>
              
              {remainingAttempts < 3 && (
                <p className="attempts-warning">
                  {remainingAttempts} tentativas restantes
                </p>
              )}
              
              <button
                onClick={handleVerifyCode}
                disabled={loading || code.join('').length !== 6}
                className="btn-primary login-modal-submit"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
              
              <div className="code-actions">
                <button
                  className="btn-link"
                  onClick={() => setStep('phone')}
                >
                  ← Voltar
                </button>
                
                {countdown > 0 ? (
                  <span className="countdown">
                    Reenviar em {countdown}s
                  </span>
                ) : (
                  <button
                    className="btn-link"
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    Reenviar código
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="login-modal-content success-content">
              <div className="success-icon">✓</div>
              <h3>Autenticado!</h3>
              <p>Redirecionando...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Render Email Login =====
  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <button className="login-modal-close" onClick={onClose}>×</button>

        <div className="login-modal-header">
          <h2>Entrar com E-mail</h2>
        </div>

        {error && <div className="login-modal-error">{error}</div>}

        <form onSubmit={handleEmailSubmit} className="login-modal-form">
          <div className="login-modal-field">
            <label>E-mail ou celular</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Seu e-mail ou celular"
              required
              autoFocus
            />
          </div>

          <div className="login-modal-field">
            <label>Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Sua senha"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-modal-submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <button 
          className="btn-link btn-back"
          onClick={() => setLoginMethod('choice')}
        >
          ← Voltar
        </button>

        <div className="login-modal-footer">
          <p>
            Não tem conta?{' '}
            <Link href="/registro" onClick={onClose}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
