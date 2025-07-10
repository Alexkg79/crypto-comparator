import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PORTFOLIO_KEY = 'cryptoPortfolio';

export function usePortfolio() {
  const [transactions, setTransactions] = useState([]);
// Charger les transactions depuis le localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(PORTFOLIO_KEY);
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const saveTransactions = (newTransactions) => {
    setTransactions(newTransactions);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newTransactions));
  };
  // Fonction pour ajouter une nouvelle transaction
  const addTransaction = (newTransaction) => {
  // On ajoute un ID unique et la date à la transaction
    const transactionWithMeta = { ...newTransaction, id: Date.now(), date: new Date().toISOString() };
    saveTransactions([...transactions, transactionWithMeta]);
    toast.success('Transaction ajoutée !');
  };
  // Fonction pour éditer une transaction
  const editTransaction = (transactionId, dataToUpdate) => {
    const updated = transactions.map(t =>
      t.id === transactionId ? { ...t, ...dataToUpdate } : t
    );
    saveTransactions(updated);
    toast.success('Transaction modifiée !');
  };
  // Fonction pour supprimer une transaction
  const deleteTransaction = (transactionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      const filtered = transactions.filter(t => t.id !== transactionId);
      saveTransactions(filtered);
      toast.error('Transaction supprimée.');
    }
  };

  return { transactions, addTransaction, editTransaction, deleteTransaction };
}