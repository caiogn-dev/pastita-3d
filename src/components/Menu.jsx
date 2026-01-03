// src/components/Menu.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Certifique-se do caminho correto

const Menu = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products/') // Endpoint da sua API
      .then(res => setProducts(res.data))
      .catch(err => console.error("Erro API:", err));
  }, []);

  return (
    <div className="py-20 px-10">
      <h2 className="text-white text-5xl font-bold mb-10">CARDÁPIO</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="border border-zinc-800 p-4 rounded-lg bg-zinc-900/50">
             <img src={p.image} className="w-full h-48 object-cover rounded" />
             <h3 className="text-white text-xl mt-4 font-bold">{p.name}</h3>
             <p className="text-zinc-400 text-sm">{p.description}</p>
             <p className="text-red-600 font-bold mt-2">R$ {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;