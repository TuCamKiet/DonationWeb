import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/shop', label: 'Sản phẩm' },
  { to: '/cau-chuyen', label: 'Câu chuyện' },
  { to: '/minh-bach', label: 'Minh bạch' },
];

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div 
        className={`nav__overlay ${open ? 'is-open' : ''}`} 
        onClick={() => setOpen(false)} 
        aria-hidden="true"
      />
      <header className="nav" ref={navRef}>
      <div className="container nav__inner">
        <Link to="/" className="brand interactive" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">🧺</span>
          <span className="brand__text">
            com<span>·</span>passion
          </span>
        </Link>

        <nav className={`nav__links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'nav__link interactive is-active' : 'nav__link interactive')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <Link to="/tai-khoan" className="nav__icon interactive" aria-label="Tài khoản">
            {user ? (
              user.avatar ? (
                <img className="nav__avatar" src={user.avatar} alt={user.name} style={{ objectFit: "cover" }} />
              ) : (
                <span className="nav__avatar">{user.name.charAt(0).toUpperCase()}</span>
              )
            ) : '👤'}
          </Link>
          <Link to="/gio-hang" className="nav__icon nav__cart interactive" aria-label="Giỏ hàng">
            🛍️
            {count > 0 && <span className="nav__badge" key={count}>{count}</span>}
          </Link>
          <button
            className="nav__burger interactive"
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
