import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import '../styles/main.scss';

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__container">
          <nav className="app-header__nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Accueil
            </NavLink>
            <NavLink to="/favoris" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Favoris
            </NavLink>
            <NavLink to="/portfolio" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Portfolio
            </NavLink>
          </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}