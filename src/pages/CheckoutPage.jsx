import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api'; // Sua instância do Axios configurada

const CheckoutPage = () => {
  const { cart, cartTotal } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', cpf: '', address: '' });
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia os dados para o seu backend Django
      const response = await api.post('/create-preference/', {
        items: cart,
        buyer: formData
      });

      // Redireciona o usuário para o Mercado Pago
      const paymentLink = response.data.init_point; // Use sandbox_init_point se estiver testando
      window.location.href = paymentLink;
      
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      alert("Erro ao conectar com o pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <h2 style={{ color: 'var(--color-marsala)' }}>Seu carrinho está vazio</h2>
      <Link to="/cardapio" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>Voltar ao Cardápio</Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        
        {/* Formulário */}
        <div>
          <h2 style={{ color: 'var(--color-marsala)', marginBottom: '30px' }}>Dados de Entrega</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <input type="text" name="name" placeholder="Nome Completo" onChange={handleChange} required style={inputStyle} />
            <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required style={inputStyle} />
            <input type="text" name="cpf" placeholder="CPF (apenas números)" onChange={handleChange} required style={inputStyle} />
            <textarea name="address" placeholder="Endereço Completo (Rua, Número, Bairro, CEP)" rows="3" onChange={handleChange} required style={inputStyle} />
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '20px', width: '100%', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'PROCESSANDO...' : 'PAGAR COM MERCADO PAGO'}
            </button>
          </form>
          <Link to="/cardapio" style={{ display: 'block', marginTop: '20px', color: '#666', textDecoration: 'none' }}>← Voltar</Link>
        </div>

        {/* Resumo Lateral */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', height: 'fit-content', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--color-marsala)' }}>Resumo</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#555' }}>
              <span>{item.quantity}x {item.name}</span>
              <span>R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px dashed #eee', margin: '20px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-marsala)' }}>
            <span>Total</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none', backgroundColor: '#fff'
};

export default CheckoutPage;