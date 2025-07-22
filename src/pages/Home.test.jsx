import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import { MemoryRouter } from "react-router-dom";
import { fetchTopCryptos, searchCryptos } from "../services/api";

// Mock les hooks custom
jest.mock("../hooks/useFavorites", () => ({
  useFavorites: () => [[], jest.fn()],
}));
// Mock le hook useInfiniteScroll
jest.mock("../hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: () => ({
    isLoading: false,
    setIsLoading: jest.fn(),
    hasMore: true,
    setHasMore: jest.fn(),
  }),
}));
// Mock API
jest.mock("../services/api", () => ({
  fetchTopCryptos: jest.fn(),
  searchCryptos: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("affiche les cryptos après chargement", async () => {
  fetchTopCryptos.mockResolvedValue([
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "btc",
      current_price: 25000,
      market_cap: 500000000000,
      image: "https://bitcoin.org/img/icons/opengraph.png",
      price_change_percentage_24h: 3.5,
    },
  ]);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Bitcoin/i)).toBeInTheDocument();
});

test("affiche un message si l'API échoue", async () => {
  fetchTopCryptos.mockRejectedValue(new Error("Échec API"));

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Erreur/i)).toBeInTheDocument();
});

test("met à jour les résultats lors d'une recherche", async () => {
  // Résultat initial
  fetchTopCryptos.mockResolvedValue([
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "btc",
      current_price: 25000,
      market_cap: 500000000000,
      image: "https://bitcoin.org/img/icons/opengraph.png",
      price_change_percentage_24h: 3.5,
    },
  ]);

  // Résultat de recherche
  searchCryptos.mockResolvedValue([
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "eth",
      current_price: 1800,
      market_cap: 200000000000,
      image: "https://ethereum.org/icon.png",
      price_change_percentage_24h: 2.1,
    },
  ]);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Bitcoin/i)).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText(/Rechercher une crypto/i), {
    target: { value: "eth" },
  });

  expect(await screen.findByText(/Ethereum/i)).toBeInTheDocument();
});

test("affiche un message quand aucune crypto n'est trouvée", async () => {
  fetchTopCryptos.mockResolvedValue([]);

  searchCryptos.mockResolvedValue([]);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Rechercher une crypto/i), {
    target: { value: "unknowncrypto" },
  });

  await waitFor(() => {
    expect(screen.getByText(/Aucune cryptomonnaie trouvée/i)).toBeInTheDocument();
  });
});
