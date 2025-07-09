const API_BASE = 'https://api.coingecko.com/api/v3'

export async function fetchTopCryptos(currency = 'usd') {
  const res = await fetch(`${API_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=false`)
  if (!res.ok) throw new Error('Erreur lors du chargement des cryptos')
  return await res.json()
}
