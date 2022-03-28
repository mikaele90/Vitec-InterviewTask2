import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="headerTopDiv">Vitec Interview Task App</div>
      <Link to="/">Templates</Link>
      <Link to="/upload">Upload</Link>
    </header>
  );
}

export default Header;
