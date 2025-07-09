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

// Enregistrement des composants dans Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

export default function CryptoDetails() {
  const { id } = useParams() // Récupère l'ID de la crypto depuis l'URL
  // États pour les données
  const [crypto, setCrypto] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)

  // Chargement des données à chaque changement d'ID ou de période
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Requêtes API : infos générales + historique du prix
        const [coinRes, marketRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/${id}`).then(res => res.json()),
          fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
            .then(res => res.json()),
        ])
        setCrypto(coinRes)

        // Formatage des labels (dates ou heures selon le cas)
        const labels = marketRes.prices.map(([timestamp]) =>
          new Date(timestamp).toLocaleDateString('fr-FR', days === 1
            ? { hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric' })
        )

        // Récupération des prix
        const prices = marketRes.prices.map(([, price]) => price)

        // Structure des données pour Chart.js
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
  
  // Affichage d'un message en attendant les données
  if (!crypto || !chartData) return <p className="text-center">Chargement des données...</p>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img src={crypto.image.large} alt={crypto.name} className="w-12 h-12" />
        <h2 className="text-2xl font-bold">{crypto.name} ({crypto.symbol.toUpperCase()})</h2>
      </div>

      <div className="mb-4 flex gap-4">
        {[1, 7, 30].map(val => (
          <button
            key={val}
            onClick={() => setDays(val)}
            className={`px-4 py-2 rounded-full ${
              days === val ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-blue-600 transition`}
          >
            {val === 1 ? '1 jour' : `${val} jours`}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-xl shadow mb-6">
        {loading ? (
          <p className="text-center">Chargement du graphique...</p>
        ) : (
          <Line data={chartData} options={{
            responsive: true,
            scales: {
              y: {
                ticks: { color: '#fff' },
                grid: { color: '#444' }
              },
              x: {
                ticks: { color: '#fff' },
                grid: { display: false }
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: '#fff'
                }
              }
            }
          }} />
        )}
      </div>

      <p className="text-gray-300">{crypto.description.en?.split('. ')[0]}.</p>
      <p className="mt-4">Prix actuel : ${crypto.market_data.current_price.usd.toLocaleString()}</p>
      <p>Capitalisation : ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
    </div>
  )
}
