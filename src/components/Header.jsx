import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import '../styles/main.scss';

// Composant d'icônes intégré
const HeaderIcons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Portfolio: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V5z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="16" cy="12" r="1" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
    </svg>
  )
};

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__container">
        <div className="app-header__logo">
          <svg width="28" height="28" viewBox="0 0 32 32" className="logo-icon">
            <path fill="currentColor" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14 14-6.2 14-14S23.8 2 16 2zm0 22c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="currentColor" d="M21.4 11.6l-1.8-1.8-6.6 6.6-2.6-2.6-1.8 1.8 4.4 4.4z"/>
          </svg>
          <span className="logo-full">CryptoFolio</span>
          <span className="logo-short">CF</span>
        </div>
        
        <nav className="app-header__nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <HeaderIcons.Home />
            <span className="nav-text">Accueil</span>
          </NavLink>
          
          <NavLink 
            to="/favoris" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <HeaderIcons.Star />
            <span className="nav-text">Favoris</span>
          </NavLink>
          
          <NavLink 
            to="/portfolio" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <HeaderIcons.Portfolio />
            <span className="nav-text">Portfolio</span>
          </NavLink>
        </nav>
        
        <div className="app-header__actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}