const API_BASE = 'https://api.coingecko.com/api/v3';

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "RateLimitError";
  }
}

// ==================================================================
// SECTION 1 : LOGIQUE DE CACHE ET DE TENTATIVES MULTIPLES
// ==================================================================

function getFromCache(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

function setToCache(key, value, ttl = 300000) { 
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Un wrapper autour de fetch qui interprète les erreurs de rate limit.
 */
async function fetchWithRetries(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        throw new RateLimitError("Trop d'appels à l'API. Veuillez patienter un peu.");
      }

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response;
    } catch (error) {
      // Si c'est une RateLimitError explicite, on la propage.
      if (error instanceof RateLimitError) {
        throw error;
      }
      
      // Si c'est une erreur réseau "Failed to fetch", on la considère comme un rate limit.
      if (error.message === 'Failed to fetch') {
        throw new RateLimitError("Trop d'appels à l'API. Veuillez patienter un peu.");
      }

      // Pour toutes les autres erreurs, on réessaie.
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

/**
 * Fonction centrale qui combine le cache et les tentatives multiples pour tous les appels API.
 */
async function apiCall(endpoint, cacheKey) {
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetchWithRetries(`${API_BASE}${endpoint}`);
  const data = await response.json();
  
  setToCache(cacheKey, data);
  return data;
}

// ==================================================================
// SECTION 2 : FONCTIONS D'API 
// ==================================================================

// Récupère les cryptos les plus populaires
export async function fetchTopCryptos(page = 1, perPage = 20) {
  const endpoint = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;
  const cacheKey = `top_cryptos_page_${page}_per_page_${perPage}`;
  return await apiCall(endpoint, cacheKey);
}
// Récupère les détails d'une crypto spécifique
export async function fetchCryptoDetails(id) {
  const endpoint = `/coins/${id}`;
  const cacheKey = `details_${id}`;
  return await apiCall(endpoint, cacheKey);
}
// Récupère le graphique d'une crypto sur X jours
export async function fetchCryptoChart(id, days = 7) {
  const endpoint = `/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const cacheKey = `chart_${id}_${days}d`;
  return await apiCall(endpoint, cacheKey);
}
// Récupère les prix actuels de plusieurs cryptos par leurs IDs
export async function fetchMarketsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const sortedIds = ids.sort().join(',');
  const endpoint = `/coins/markets?vs_currency=usd&ids=${sortedIds}`;
  const cacheKey = `markets_${sortedIds}`;
  return await apiCall(endpoint, cacheKey);
}
// Recherche de cryptos par nom
export async function searchCryptos(query) {
  if (!query) return [];
  const searchEndpoint = `/search?query=${query}`;
  const cacheKey = `search_${query}`;
  const searchResult = await apiCall(searchEndpoint, cacheKey);
  if (!searchResult.coins || searchResult.coins.length === 0) return [];
  const ids = searchResult.coins.map(coin => coin.id);
  return await fetchMarketsByIds(ids);
}