const API_BASE = 'https://api.coingecko.com/api/v3';
const CRYPTOS_PER_PAGE = 20;

// Modifiée pour accepter un numéro de page pour le scroll infini
export async function fetchTopCryptos(page = 1) {
  const res = await fetch(`${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CRYPTOS_PER_PAGE}&page=${page}&sparkline=false`);
  if (!res.ok) throw new Error('Erreur lors du chargement des cryptos');
  return await res.json();
}

// Nouvelle fonction pour la recherche
export async function searchCryptos(query) {
  if (!query) return []; // Retourne un tableau vide si la recherche est vide

  const res = await fetch(`${API_BASE}/search?query=${query}`);
  if (!res.ok) throw new Error('Erreur lors de la recherche');
  
  const data = await res.json();

  // On normalise les données pour qu'elles matchent le format de CryptoCard
  // C'est ici qu'on met des valeurs par défaut pour les données manquantes
  return data.coins.map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.large,
    current_price: 0,
    market_cap: 0,
    price_change_percentage_24h: 0,
  }));
}