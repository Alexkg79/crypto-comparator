import { useState, useEffect } from 'react';

export function useTheme() {
  // On lit le thème depuis localStorage, ou on prend le thème du système par défaut
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Ce useEffect s'exécute à chaque changement de thème
  useEffect(() => {
    // On met à jour la classe sur le body
  document.documentElement.className = '';// On nettoie d'abord
  document.documentElement.classList.add(`${theme}-theme`);

    // On sauvegarde le choix dans le localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}