import React from 'react';
import { useEffect, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

export default function Portfolio() {
  // On récupère les fonctions depuis l'objet retourné par le hook
  const { transactions, addTransaction, editTransaction, deleteTransaction } = usePortfolio();
  
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    if (transactions.length === 0) {
      setPortfolioData([]);
      setLoading(false);
      return;
    }

    const fetchCurrentPrices = async () => {
      setLoading(true);
      // 1. Récupérer les ID uniques de toutes les cryptos dans le portefeuille
      const cryptoIds = [...new Set(transactions.map(t => t.cryptoId))].join(',');
      // 2. Appeler l'API pour avoir les prix actuels
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}`);
        const currentPrices = await response.json();
        // 3. Créer une table de correspondance (id -> prix) pour un accès facile
        const priceMap = new Map(currentPrices.map(c => [c.id, { price: c.current_price, image: c.image }]));

        // 4. Calculer les données pour chaque transaction
        const data = transactions.map(t => {
          const currentData = priceMap.get(t.cryptoId) || {};
          const currentPrice = currentData.price || 0;
          const image = currentData.image || '';
          
          const currentValue = t.quantity * currentPrice;
          const initialValue = t.quantity * t.pricePerCoin;
          const pnl = currentValue - initialValue;
          const pnlPercent = initialValue === 0 ? 0 : (pnl / initialValue) * 100;

          return { ...t, currentValue, pnl, pnlPercent, image };
        });
        setPortfolioData(data);
      } catch (error) {
        console.error("Erreur API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPrices();
  }, [transactions]);

  if (loading) return <p className="loading-message">Chargement du portefeuille...</p>;
  // Calculer les valeurs totales
  const totalInitialValue = portfolioData.reduce((sum, t) => sum + (t.quantity * t.pricePerCoin), 0);
  const totalCurrentValue = portfolioData.reduce((sum, t) => sum + t.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInitialValue;

  return (
    <div className="home-container">
      <div className="portfolio-header">
        <h1 className="home-container__title">📈 Mon Portefeuille</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Ajouter une transaction
        </button>
      </div>

      <div className="portfolio-summary">
        <div className="summary-box">
          <h2>Profit / Perte Total</h2>
          <p className={totalPnl >= 0 ? 'positive' : 'negative'}>
            ${totalPnl.toFixed(2)}
            {totalInitialValue !== 0 && <span> ({((totalPnl / totalInitialValue) * 100).toFixed(2)}%)</span>}
          </p>
        </div>
        <div className="summary-box">
          <h2>Valeur Actuelle Totale</h2>
          <p className="total-value">
            ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      
      {transactions.length > 0 ? (
        <div className="table-wrapper">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Actif</th>
                <th>Quantité</th>
                <th>Prix d'achat</th>
                <th>Valeur Actuelle</th>
                <th>P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map(t => (
                <tr key={t.id}>
                  <td data-label="Actif">
                    <div className="crypto-cell">
                      <img src={t.image || undefined} alt={t.symbol} />
                      <span>{t.symbol.toUpperCase()}</span>
                    </div>
                  </td>
                  <td data-label="Quantité">{t.quantity}</td>
                  <td data-label="Prix d'achat">${t.pricePerCoin.toLocaleString()}</td>
                  <td data-label="Valeur Actuelle">${t.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td data-label="P&L">
                    <span className={t.pnl >= 0 ? 'positive' : 'negative'}>
                      ${t.pnl.toFixed(2)} ({t.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => setEditModal(t)} aria-label="Modifier">
                        <EditIcon />
                      </button>
                      <button className="icon-btn btn-delete" onClick={() => deleteTransaction(t.id)} aria-label="Supprimer">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="watchlist-empty">
          <p className="watchlist-empty__message">Votre portefeuille est vide. Ajoutez une transaction pour commencer.</p>
        </div>
      )}

      {isModalOpen && (
        <AddTransactionModal onClose={() => setIsModalOpen(false)} onAddTransaction={addTransaction} />
      )}
      {editModal && (
        <EditTransactionModal transaction={editModal} onClose={() => setEditModal(null)} onEditTransaction={editTransaction} />
      )}
    </div>
  );
}