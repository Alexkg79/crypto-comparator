import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

export default function CryptoDetails() {
  const { id } = useParams()
  const [crypto, setCrypto] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [coinRes, marketRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/${id}`).then(res => res.json()),
          fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
            .then(res => res.json()),
        ])
        setCrypto(coinRes)

        const labels = marketRes.prices.map(([timestamp]) =>
          new Date(timestamp).toLocaleDateString('fr-FR', days === 1
            ? { hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric' })
        )
        const prices = marketRes.prices.map(([, price]) => price)
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Prix USD',
              data: prices,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 0,
            }
          ]
        })
      } catch (err) {
        console.error("Erreur :", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, days])
  
  if (!crypto || !chartData) return <p className="loading-message">Chargement des données...</p>

  return (
    <div className="details-container">
      <header className="details-header">
        <img src={crypto.image.large} alt={crypto.name} className="details-header__image" />
        <div className="details-header__info">
          <h2>{crypto.name} <span>({crypto.symbol.toUpperCase()})</span></h2>
          <p>💰 Prix : ${crypto.market_data.current_price.usd.toLocaleString()}</p>
          <p className="market-cap">🏦 Capitalisation : ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
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
        {loading ? (
          <p className="loading-message">Chargement du graphique...</p>
        ) : (
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

      <section className="about-section">
        <h3 className="about-section__title">📘 À propos</h3>
        <p className="about-section__description">{crypto.description.en?.split('. ')[0]}.</p>
      </section>
    </div>
  )
}