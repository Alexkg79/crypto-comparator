import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EditTransactionModal({ transaction, onClose, onEditTransaction }) {
  const [quantity, setQuantity] = useState(transaction.quantity);
  const [pricePerCoin, setPricePerCoin] = useState(transaction.pricePerCoin);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(pricePerCoin);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Veuillez entrer des valeurs numériques valides et positives.');
      return;
    }

    // On appelle la fonction passée en prop avec les BONS arguments : l'ID et un objet des données modifiées
    onEditTransaction(transaction.id, {
      quantity: parsedQuantity,
      pricePerCoin: parsedPrice,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Modifier la transaction pour {transaction.symbol.toUpperCase()}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Quantité :
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Prix par coin ($) :
            <input
              type="number"
              step="any"
              value={pricePerCoin}
              onChange={(e) => setPricePerCoin(e.target.value)}
              required
            />
          </label>
          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">Sauvegarder</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}