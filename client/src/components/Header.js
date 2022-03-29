import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="headerTopDiv"><h1>Vitec Interview Task App</h1></div>
      <Link to="/">Templates</Link>
      <Link to="/upload">Upload</Link>
    </header>
  );
}

export default Header;
