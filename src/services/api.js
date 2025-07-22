const API_BASE = 'https://api.coingecko.com/api/v3';
const CRYPTOS_PER_PAGE = 20;

// Fonction pour récupérer les cryptos principales 
export async function fetchTopCryptos(page = 1) {
  const res = await fetch(`${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CRYPTOS_PER_PAGE}&page=${page}&sparkline=false`);
  if (!res.ok) throw new Error('Erreur lors du chargement des cryptos');
  return await res.json();
}

// Fonction pour la recherche
export async function searchCryptos(query) {
  if (!query) return []; // Retourne un tableau vide si la recherche est vide

  const res = await fetch(`${API_BASE}/search?query=${query}`);
  if (!res.ok) throw new Error('Erreur lors de la recherche');
  
  const data = await res.json();

  // On normalise les données pour qu'elles matchent le format de CryptoCard
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

// Fonction pour récupérer les détails d'une crypto
export async function fetchCryptoDetails(id) {
  const res = await fetch(`${API_BASE}/coins/${id}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des détails de la crypto');
  const data = await res.json();
  
  // Gère le cas où l'API renvoie une erreur
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}

// Fonction pour récupérer les données du graphique
export async function fetchCryptoChart(id, days = 7) {
  const res = await fetch(`${API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des données du graphique');
  const data = await res.json();
  
  // Gère le cas où l'API renvoie une erreur
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}

/**
 * Récupère les données de marché complètes pour une liste d'IDs.
 * @param {string[]} ids - Un tableau d'IDs de cryptos (ex: ['bitcoin', 'ethereum']).
 * @returns {Promise<Array>}
 */
export async function fetchMarketsByIds(ids) {
  if (!ids || ids.length === 0) {
    return []; 
  }
  const idString = ids.join(',');
  const res = await fetch(`${API_BASE}/coins/markets?vs_currency=usd&ids=${idString}`);
  if (!res.ok) {
    throw new Error("La requête pour les favoris a échoué.");
  }
  return res.json();
}