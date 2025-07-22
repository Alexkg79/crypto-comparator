import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CryptoDetails from "./CryptoDetails";
import * as api from "../services/api";

// Helper pour créer un mock de données crypto complet et cohérent
const createCryptoMock = (overrides = {}) => ({
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "btc",
  image: {
    large: "https://bitcoin.org/img/icons/opengraph.png",
  },
  market_data: {
    current_price: {
      usd: 25000,
    },
    market_cap: {
      usd: 500000000000,
    },
    price_change_percentage_24h: 3.5,
  },
  description: {
    en: "Bitcoin is a decentralized digital currency.",
  },
  ...overrides,
});

// Mock des données pour le graphique
const mockChartData = {
  prices: [
    [1620000000000, 10000],
    [1620003600000, 12000],
    [1620007200000, 14000],
  ],
};

// Mock des fonctions du service API
jest.mock("../services/api", () => ({
  fetchCryptoDetails: jest.fn(),
  fetchCryptoChart: jest.fn(),
}));

// Mock nécessaire pour la librairie de graphiques
jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="graph-mock">Graph mock</div>,
}));

// Mock nécessaire car l'API du <canvas> n'existe pas dans l'environnement de test (JSDOM)
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn();
});

// Réinitialiser les mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Configuration des mocks par défaut
  api.fetchCryptoDetails.mockResolvedValue(createCryptoMock());
  api.fetchCryptoChart.mockResolvedValue(mockChartData);
});

test("affiche les infos de la crypto après chargement", async () => {
  render(
    <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
      <Routes>
        <Route path="/crypto/:id" element={<CryptoDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // On attend que le nom de la crypto apparaisse à l'écran
  expect(
    await screen.findByRole('heading', { name: /Bitcoin/i, level: 2 })
  ).toBeInTheDocument();
  
  // On vérifie que les informations principales sont bien affichées
  expect(screen.getByText(/\$25 000/)).toBeInTheDocument();
  expect(screen.getByText(/Capitalisation/i)).toBeInTheDocument();
  expect(screen.getByTestId("graph-mock")).toBeInTheDocument();

  // On vérifie que les fonctions de l'API ont été appelées
  expect(api.fetchCryptoDetails).toHaveBeenCalledWith("bitcoin");
  expect(api.fetchCryptoChart).toHaveBeenCalledWith("bitcoin", 7);
});

test("affiche un état de chargement initial avant d'afficher les données", async () => {
  render(
    <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
      <Routes>
        <Route path="/crypto/:id" element={<CryptoDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // Au premier rendu, on doit voir le message de chargement
  expect(screen.getByText(/Chargement des données.../i)).toBeInTheDocument();

  // Puis on attend que les données finales s'affichent
  // On utilise findByRole pour cibler spécifiquement le titre h2
  expect(await screen.findByRole('heading', { name: /Bitcoin/i, level: 2 })).toBeInTheDocument();

  // Et le message de chargement doit avoir disparu
  expect(screen.queryByText(/Chargement des données.../i)).not.toBeInTheDocument();
});

test("affiche une erreur quand l'API échoue", async () => {
  // On configure les mocks pour simuler une erreur
  api.fetchCryptoDetails.mockRejectedValue(new Error("Erreur API"));
  api.fetchCryptoChart.mockRejectedValue(new Error("Erreur API"));

  render(
    <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
      <Routes>
        <Route path="/crypto/:id" element={<CryptoDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // On attend que le message d'erreur s'affiche
  expect(await screen.findByText(/Erreur : Erreur API/i)).toBeInTheDocument();

  // On vérifie que les fonctions ont bien été appelées malgré l'erreur
  expect(api.fetchCryptoDetails).toHaveBeenCalledWith("bitcoin");
  expect(api.fetchCryptoChart).toHaveBeenCalledWith("bitcoin", 7);
});