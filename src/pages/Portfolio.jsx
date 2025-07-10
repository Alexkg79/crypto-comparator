import { useEffect, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';

export default function Portfolio() {
  const [transactions, addTransaction, deleteTransaction, editTransaction] = usePortfolio();
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    if (transactions.length === 0) {
      setLoading(false);
      return;
    }

    const fetchCurrentPrices = async () => {
      // 1. Récupérer les ID uniques de toutes les cryptos dans le portefeuille
      const cryptoIds = [...new Set(transactions.map(t => t.cryptoId))].join(',');

      // 2. Appeler l'API pour avoir les prix actuels
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}`);
      const currentPrices = await response.json();

      // 3. Créer une table de correspondance (id -> prix) pour un accès facile
      const priceMap = new Map(currentPrices.map(c => [c.id, c.current_price]));

      // 4. Calculer les données pour chaque transaction
      const data = transactions.map(t => {
        const currentValue = t.quantity * priceMap.get(t.cryptoId);
        const initialValue = t.quantity * t.pricePerCoin;
        const pnl = currentValue - initialValue;
        const pnlPercent = (pnl / initialValue) * 100;
        return {
          ...t,
          currentValue,
          pnl,
          pnlPercent,
        };
      });

      setPortfolioData(data);
      setLoading(false);
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
            <span> ({((totalPnl / totalInitialValue) * 100).toFixed(2)}%)</span>
          </p>
        </div>

        <div className="summary-box">
          <h2>Valeur Actuelle Totale</h2>
          <p className="total-value">
            ${totalCurrentValue.toLocaleString()}
          </p>
        </div>
      </div>
      
      {transactions.length > 0 ? (
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>Actif</th>
              <th>Quantité</th>
              <th>Prix d'achat</th>
              <th>Valeur Actuelle</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {portfolioData.map(t => (
              <tr key={t.id}>
                <td>
                  <div className="crypto-cell">
                    <span>{t.symbol}</span>
                  </div>
                </td>
                <td>{t.quantity}</td>
                <td>${t.pricePerCoin.toLocaleString()}</td>
                <td>${t.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  <span className={t.pnl >= 0 ? 'positive' : 'negative'}>
                    ${t.pnl.toFixed(2)} ({t.pnlPercent.toFixed(2)}%)
                  </span>
                </td>
                <td>
                  <button onClick={() => setEditModal(t)} className="btn btn-sm btn-secondary mr-2">Modifier</button>
                  <button onClick={() => deleteTransaction(t.id)} className="btn btn-sm btn-danger">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="loading-message">Vous n'avez encore aucune transaction.</p>
      )}

      
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={addTransaction}
        />
      )}

      {editModal && (
        <EditTransactionModal
          transaction={editModal}
          onClose={() => setEditModal(null)}
          onEdit={editTransaction}
        />
      )}
    </div>
  );
}