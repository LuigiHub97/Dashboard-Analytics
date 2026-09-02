import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">Dashboard Analytics</div>
      <nav className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => (isActive ? "active" : "")}>
          Transações
        </NavLink>
      </nav>
      <div className="navbar-user">
        <span>{user?.name || user?.email}</span>
        <button className="btn-secondary" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
