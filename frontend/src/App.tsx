import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { EmpresaDashboard } from "./pages/EmpresaDashboard";
import { EmpresaIngredients } from "./pages/EmpresaIngredients";
import { EmpresaPizzas } from "./pages/EmpresaPizzas";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Transactions } from "./pages/Transactions";
import { WorkspacePicker } from "./pages/WorkspacePicker";

function AppLayout() {
  const { token } = useAuth();
  const location = useLocation();
  const isBusiness = location.pathname.startsWith("/business");

  useEffect(() => {
    document.body.classList.toggle("theme-empresa", isBusiness);
  }, [isBusiness]);

  return (
    <>
      {token && <Navbar />}
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<WorkspacePicker />} />
            <Route path="/personal" element={<Dashboard />} />
            <Route path="/personal/transactions" element={<Transactions />} />
            <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
            <Route path="/business/dashboard" element={<EmpresaDashboard />} />
            <Route path="/business/pizzas" element={<EmpresaPizzas />} />
            <Route path="/business/ingredients" element={<EmpresaIngredients />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
