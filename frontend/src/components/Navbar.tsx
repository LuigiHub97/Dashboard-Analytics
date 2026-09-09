import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProfileEditModal } from "./ProfileEditModal";

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
  const location = useLocation();
  const isBusiness = location.pathname.startsWith("/business");
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSwitchWorkspace() {
    localStorage.removeItem("workspace");
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 17l5-5 4 4 7-9" stroke="#12261c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="navbar-brand-text">{isBusiness ? user?.businessName || "Empresa" : "Dashboard Analytics"}</span>
      </div>
      <nav className="navbar-links">
        {isBusiness ? (
          <>
            <NavLink to="/business/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="/business/pizzas" className={({ isActive }) => (isActive ? "active" : "")}>
              Pizzas
            </NavLink>
            <NavLink to="/business/ingredients" className={({ isActive }) => (isActive ? "active" : "")}>
              Ingredientes
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/personal" end className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="/personal/transactions" className={({ isActive }) => (isActive ? "active" : "")}>
              Transações
            </NavLink>
          </>
        )}
      </nav>
      <div className="navbar-user-menu">
        <button type="button" className="navbar-user-trigger">
          <span className="navbar-avatar">{initials(user?.name, user?.email)}</span>
          <span className="navbar-user-name">{user?.name || user?.email}</span>
        </button>
        <div className="navbar-user-dropdown">
          <button type="button" onClick={handleSwitchWorkspace}>
            Trocar conta
          </button>
          <button type="button" onClick={() => setShowProfileEdit(true)}>
            Editar perfil
          </button>
          <button type="button" className="navbar-user-dropdown-danger" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      {showProfileEdit && <ProfileEditModal onClose={() => setShowProfileEdit(false)} />}
    </header>
  );
}
