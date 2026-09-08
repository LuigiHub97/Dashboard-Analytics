import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { EmpresaIngredients } from "./pages/EmpresaIngredients";
import { EmpresaPizzas } from "./pages/EmpresaPizzas";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Transactions } from "./pages/Transactions";
import { WorkspacePicker } from "./pages/WorkspacePicker";

function AppLayout() {
  const { token } = useAuth();
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
            <Route path="/business" element={<Navigate to="/business/pizzas" replace />} />
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
