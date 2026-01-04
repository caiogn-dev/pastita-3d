import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/CartSidebar'; // Importe a Sidebar

const Cardapio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartCount, toggleCart } = useCart();

  useEffect(() => {
    api.get('/products/')
      .then(res => {
        const data = res.data.results || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Erro menu:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh', paddingBottom: '80px' }}>
      <CartSidebar /> {/* Sidebar injetada aqui */}

      {/* Navbar Fixa */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#fff', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', padding: '15px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-marsala)', fontSize: '1.5rem', fontWeight: 'bold' }}>PASTITA</Link>
          <button onClick={toggleCart} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 CARRINHO <span style={{ background: '#fff', color: 'var(--color-marsala)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <span style={{ color: 'var(--color-gold)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.85rem' }}>Artesanal</span>
        <h2 style={{ fontSize: '3rem', color: 'var(--color-marsala)', margin: '10px 0' }}>Nosso Cardápio</h2>
        <div style={{ width: '50px', height: '3px', backgroundColor: 'var(--color-gold)', margin: '0 auto' }}></div>
      </div>

      {/* Grid de Produtos */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ 
            backgroundColor: '#fff', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid var(--color-gold)', // A Borda Dourada Pedida
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            transition: 'transform 0.3s ease',
            display: 'flex', flexDirection: 'column'
          }}>
            
            {/* Área da Imagem */}
            <div style={{ height: '260px', overflow: 'hidden', position: 'relative', borderBottom: '1px solid #f0f0f0' }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: '#fff', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', color: 'var(--color-marsala)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                R$ {Number(p.price).toFixed(2)}
              </div>
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#1a1a1a', marginBottom: '10px' }}>{p.name}</h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>{p.description}</p>
              
              <button 
                onClick={() => addToCart(p)}
                style={{ 
                  width: '100%', padding: '14px', backgroundColor: 'transparent', 
                  border: '2px solid var(--color-marsala)', color: 'var(--color-marsala)', 
                  fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px',
                  cursor: 'pointer', transition: 'all 0.3s'
                }}
                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--color-marsala)'; e.target.style.color = '#fff'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--color-marsala)'; }}
              >
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cardapio;