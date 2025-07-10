import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EditTransactionModal({ transaction, onClose, onEdit }) {
  const [quantity, setQuantity] = useState(transaction.quantity);
  const [pricePerCoin, setPricePerCoin] = useState(transaction.pricePerCoin);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifie que les champs sont bien des nombres valides
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(pricePerCoin);

    if (isNaN(parsedQuantity) || isNaN(parsedPrice)) {
      toast.error('Veuillez entrer des valeurs valides');
      return;
    }

    onEdit({
      ...transaction,
      quantity: parsedQuantity,
      pricePerCoin: parsedPrice,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Modifier la transaction</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Quantité :
            <input
              type="number"
              step="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          <label>
            Prix par coin ($) :
            <input
              type="number"
              step="0.01"
              value={pricePerCoin}
              onChange={(e) => setPricePerCoin(e.target.value)}
              required
            />
          </label>

          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">Valider</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
