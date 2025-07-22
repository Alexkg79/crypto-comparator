import React from 'react';
import { useEffect, useReducer, useState, useMemo } from 'react';
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
import { useFavorites } from '../hooks/useFavorites';
import AddTransactionModal from '../components/AddTransactionModal';
import { fetchCryptoDetails, fetchCryptoChart } from '../services/api.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// --- Définition de l'état initial pour notre reducer ---
const initialState = {
  loading: true,
  error: null,
  crypto: null,
  chartData: null,
};

// --- Le reducer pour gérer les états complexes de manière plus sûre ---
function reducer(state, action) {
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
      return state;
  }
}

// --- Fonction utilitaire pour récupérer les couleurs CSS ---
const getCSSVariable = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

export default function CryptoDetails() {
  const { id } = useParams();
  const [days, setDays] = useState(7);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [themeKey, setThemeKey] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { addTransaction } = usePortfolio();
  const [favorites, toggleFavorite] = useFavorites(); // Hook pour les favoris
  const { crypto, chartData, loading, error } = state;

  // --- Détection du viewport mobile ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fonction pour créer les données du graphique avec les bonnes couleurs ---
  const createChartData = (marketData) => {
    const labels = marketData.prices.map(([timestamp]) => {
      const date = new Date(timestamp);
      return days === 1 
        ? date.toLocaleTimeString('fr-FR', { hour: '2-digit' })
        : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });

    const prices = marketData.prices.map(([, price]) => price);
    const chartColor = '#00D2FF';
    const bgFill = 'rgba(0, 210, 255, 0.1)';

    return {
      labels,
      datasets: [{
        label: 'Prix USD',
        data: prices,
        borderColor: chartColor,
        backgroundColor: bgFill,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: chartColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }]
    };
  };

  // --- Chargement des données depuis l'API ---
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        // Utilisation des fonctions du service API
        const [coinData, marketData] = await Promise.all([
          fetchCryptoDetails(id),
          fetchCryptoChart(id, days),
        ]);

        const formattedChart = createChartData(marketData);
        // Envoie les données au state en cas de succès
        dispatch({ type: 'FETCH_SUCCESS', payload: { crypto: coinData, chartData: formattedChart } });
      } catch (err) {
        // Envoie l'erreur au state
        dispatch({ type: 'FETCH_ERROR', payload: err.message });
      }
    };

    fetchData();
  }, [id, days]);// Le useEffect se relance si l'id ou le nombre de jours change
  
  // --- Détecte le changement de thème pour mettre à jour les couleurs du texte ---
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeKey(prev => prev + 1);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // --- Options dynamiques pour Chart.js ---
  const chartOptions = useMemo(() => {
    const textColor = getCSSVariable('--text-primary');
    const borderColor = getCSSVariable('--border-color');
    const bgTooltip = getCSSVariable('--bg-secondary');

    // Configuration pour l'axe X basée sur la période
    const getMaxTicksLimit = () => {
      if (days === 1) return 8;
      if (days === 7) return 4;
      return 6;
    };

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      layout: {
        padding: isMobile ? {
          top: 20,
          right: 15,
          bottom: 25,
          left: 15
        } : 10
      },
      scales: {
        y: {
          position: 'right',
          ticks: {
            color: textColor,
            font: { size: isMobile ? 10 : 11 },
            padding: 20,
            callback: (value) => {
              const formatter = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumSignificantDigits: 3
              });
              return '$' + formatter.format(value);
            }
          },
          grid: {
            color: borderColor,
            drawTicks: false,
            lineWidth: (ctx) => ctx.tick.value === 0 ? 1 : 0.5
          }
        },
        x: {
          ticks: {
            color: textColor,
            font: { size: isMobile ? 10 : 11 },
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: getMaxTicksLimit()
          },
          grid: { 
            display: false,
            drawBorder: false,
          }
        }
      },
      plugins: {
        legend: {
          display: !isMobile,
          labels: { 
            color: textColor,
            usePointStyle: true,
            padding: 20,
            font: { size: isMobile ? 12 : 13 }
          },
        },
        tooltip: {
          backgroundColor: bgTooltip,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: borderColor,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          bodyFont: { size: isMobile ? 13 : 14 },
          titleFont: { size: isMobile ? 14 : 15 },
          callbacks: {
            label: function(context) {
              return `Prix: $${context.parsed.y.toLocaleString()}`;
            }
          }
        },
      },
    };
  }, [isMobile, themeKey, days]);

  // --- États ---
  if (loading) return <p className="loading-message">Chargement des données...</p>;
  if (error) return <p className="error-message">Erreur : {error}</p>;
  // Si crypto n'existe pas après le chargement, c'est qu'il y a un problème
  if (!crypto) return <p className="error-message">Crypto introuvable.</p>;

  // --- Affichage principal ---
  return (
    <div className="details-container">
      <header className="details-header">
        <img src={crypto?.image?.large} alt={crypto?.name} className="details-header__image" />
        <div className="details-header__info">
          <h2>
            {crypto?.name} <span>({crypto?.symbol?.toUpperCase()})</span>
            <button 
              className={`favorite-btn ${favorites.includes(crypto.id) ? 'favorite-btn--active' : ''}`}
              onClick={() => toggleFavorite(crypto.id)}
              title={favorites.includes(crypto.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {favorites.includes(crypto.id) ? '★' : '☆'}
            </button>
          </h2>
          <p>💰 Prix : ${crypto.market_data.current_price.usd.toLocaleString()}</p>
          <p className="market-cap">🏦 Capitalisation : ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
        </div>
        <div className="details-header__actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Ajouter une transaction</button>
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
          <Line
            key={`${themeKey}-${isMobile ? 'mobile' : 'desktop'}`}
            data={chartData}
            options={chartOptions}
          />
        )}
      </div>

      <Converter
        cryptoSymbol={crypto.symbol.toUpperCase()}
        fiatSymbol="USD"
        currentPrice={crypto.market_data.current_price.usd}
      />

      <section className="about-section">
        <h3 className="about-section__title">📘 À propos</h3>
        <p className="about-section__description">
          {crypto.description.en?.split('. ')[0] || "Aucune description disponible."}.
        </p>
      </section>

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