import React from 'react';
import { useState, useEffect } from 'react';
import { fetchTopCryptos } from '../services/api';

// On passe le crypto en prop optionnelle
export default function AddTransactionModal({ crypto, onClose, onAddTransaction }) {
  const [allCryptos, setAllCryptos] = useState([]); // Pour le sélecteur
  const [selectedCrypto, setSelectedCrypto] = useState(crypto || null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(crypto?.market_data.current_price.usd || '');

  // Si on n'a pas de crypto, on charge la liste pour le sélecteur
  useEffect(() => {
    // Si on n'a pas de crypto, on charge la liste pour le sélecteur
    if (!crypto) {
      const loadCryptos = async () => {
        try {
          const data = await fetchTopCryptos(1, 100);
          setAllCryptos(data);
        } catch (error) {
          console.error("Impossible de charger la liste des cryptos", error);
        }
      };
      loadCryptos();
    }
  }, [crypto]);

  // Met à jour le prix quand on sélectionne une crypto dans la liste
  const handleCryptoSelect = (cryptoId) => {
    const foundCrypto = allCryptos.find(c => c.id === cryptoId);
    if (foundCrypto) {
      setSelectedCrypto(foundCrypto);
      setPrice(foundCrypto.current_price);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCrypto || !quantity || !price || parseFloat(quantity) <= 0) {
      alert("Veuillez sélectionner une crypto et entrer une quantité/prix valides.");
      return;
    }

    onAddTransaction({
      cryptoId: selectedCrypto.id,
      symbol: selectedCrypto.symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      pricePerCoin: parseFloat(price),
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Ajouter une transaction</h2>
        
        {/* Affiche le sélecteur seulement si aucune crypto n'est fournie */}
        {!crypto && (
          <div className="form-group">
            <label htmlFor="crypto-select">Choisir une crypto</label>
            <select id="crypto-select" onChange={(e) => handleCryptoSelect(e.target.value)} required>
              <option value="">Sélectionnez...</option>
              {allCryptos.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Quantité</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 0.5"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Prix d'achat par unité (USD)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Ajouter la transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}