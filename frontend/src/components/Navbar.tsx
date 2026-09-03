import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function initials(name?: string | null, email?: string): string {
  const source = name?.trim() || email || "";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 17l5-5 4 4 7-9" stroke="#12261c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Dashboard Analytics
      </div>
      <nav className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => (isActive ? "active" : "")}>
          Transações
        </NavLink>
      </nav>
      <div className="navbar-user">
        <span className="navbar-avatar">{initials(user?.name, user?.email)}</span>
        <span>{user?.name || user?.email}</span>
        <button className="btn-secondary" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
