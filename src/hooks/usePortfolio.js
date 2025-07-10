import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PORTFOLIO_KEY = 'cryptoPortfolio';

export function usePortfolio() {
  const [transactions, setTransactions] = useState([]);

  // Charger les transactions depuis le localStorage au démarrage
  useEffect(() => {
    const storedTransactions = localStorage.getItem(PORTFOLIO_KEY);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  // Fonction pour ajouter une nouvelle transaction
  const addTransaction = (newTransaction) => {
    // On ajoute un ID unique et la date à la transaction
    const transactionWithId = {
      ...newTransaction,
      id: Date.now(),
      date: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, transactionWithId];
    setTransactions(updatedTransactions);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updatedTransactions));

    toast.success('Transaction ajoutée avec succès !');
  };

  // Fonction pour supprimer une transaction
  const deleteTransaction = (id) => {
    const updated = transactions.filter(tx => tx.id !== id);
    setTransactions(updated);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updated));
    toast.success('Transaction supprimée');
    location.reload();
  };

  // Fonction pour éditer une transaction
  const editTransaction = (updatedTx) => {
    const updated = transactions.map(tx =>
      tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx
    );
    setTransactions(updated);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updated));
    toast.success('Transaction mise à jour');
  };

  return [transactions, addTransaction, deleteTransaction, editTransaction];
}