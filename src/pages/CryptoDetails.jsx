import { useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Converter from '../components/Converter';
import { usePortfolio } from '../hooks/usePortfolio';
import AddTransactionModal from '../components/AddTransactionModal';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// --- Définition de l'état initial pour notre reducer ---
const initialState = {
  loading: true,
  error: null,
  crypto: null,
  chartData: null,
};

// --- Le reducer pour gérer les états complexes de manière plus sûre ---
function cryptoDetailsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        crypto: action.payload.crypto,
        chartData: action.payload.chartData,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Action non supportée dans le reducer.");
  }
}

export default function CryptoDetails() {
  const { id } = useParams();
  const [state, dispatch] = useReducer(cryptoDetailsReducer, initialState);
  const { loading, error, crypto, chartData } = state;
  const [days, setDays] = useState(7);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, addTransaction] = usePortfolio();

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const [coinRes, marketRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/${id}`).then(res => res.json()),
          fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`).then(res => res.json()),
        ]);
        
        // Gère le cas où l'API renvoie une erreur
        if (coinRes.error || marketRes.error) {
            throw new Error(coinRes.error || marketRes.error);
        }

        const labels = marketRes.prices.map(([timestamp]) =>
          new Date(timestamp).toLocaleDateString('fr-FR', days === 1
            ? { hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric' })
        );
        const prices = marketRes.prices.map(([, price]) => price);
        
        const formattedChartData = {
          labels,
          datasets: [{
            label: 'Prix USD',
            data: prices,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          }]
        };

        // Envoie les données au state en cas de succès
        dispatch({ type: 'FETCH_SUCCESS', payload: { crypto: coinRes, chartData: formattedChartData } });
      } catch (err) {
        // Envoie l'erreur au state
        dispatch({ type: 'FETCH_ERROR', payload: err.message });
      }
    };

    fetchData();
  }, [id, days]); // Le useEffect se relance si l'id ou le nombre de jours change

  // --- Affichage des états de chargement et d'erreur ---
  if (loading) return <p className="loading-message">Chargement des données...</p>;
  if (error) return <p className="error-message">Erreur : {error}</p>;
  // Si crypto n'existe pas après le chargement, c'est qu'il y a un problème
  if (!crypto) return <p className="error-message">Impossible de trouver les données pour cette cryptomonnaie.</p>;


  return (
    <div className="details-container">
      <header className="details-header">
        <img src={crypto.image.large} alt={crypto.name} className="details-header__image" />
        <div className="details-header__info">
          <h2>{crypto.name} <span>({crypto.symbol.toUpperCase()})</span></h2>
          <p>💰 Prix : ${crypto.market_data.current_price.usd.toLocaleString()}</p>
          <p className="market-cap">🏦 Capitalisation : ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
        </div>
        <div className="details-header__actions">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                Ajouter une transaction
            </button>
        </div>
      </header>

      <div className="time-selector">
        {[1, 7, 30].map(val => (
          <button
            key={val}
            onClick={() => setDays(val)}
            className={`time-selector__button ${days === val ? 'time-selector__button--active' : 'time-selector__button--inactive'}`}
          >
            {val === 1 ? '1 jour' : `${val} jours`}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {chartData && (
          <Line data={chartData} options={{
            responsive: true,
            scales: {
              y: { ticks: { color: '#f3f4f6' }, grid: { color: '#4b5563' } },
              x: { ticks: { color: '#f3f4f6' }, grid: { display: false } }
            },
            plugins: { legend: { labels: { color: '#f3f4f6' } } }
          }} />
        )}
      </div>

      <Converter
        cryptoSymbol={crypto.symbol.toUpperCase()}
        fiatSymbol="USD"
        currentPrice={crypto.market_data.current_price.usd}
      />

      <section className="about-section">
        <h3 className="about-section__title">📘 À propos</h3>
        <p className="about-section__description">{crypto.description.en?.split('. ')[0] || "Aucune description disponible."}.</p>
      </section>

      {/* La modale ne s'affiche que si isModalOpen est true */}
      {isModalOpen && (
        <AddTransactionModal
          crypto={crypto}
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={addTransaction}
        />
      )}
    </div>
  );
}