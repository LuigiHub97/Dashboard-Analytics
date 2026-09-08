import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "workspace";

export function WorkspacePicker() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "personal" || saved === "business") {
    return <Navigate to={`/${saved}`} replace />;
  }

  function enter(workspace: "personal" | "business") {
    localStorage.setItem(STORAGE_KEY, workspace);
    navigate(`/${workspace}`);
  }

  async function handleSetupBusiness(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!businessName.trim()) {
      setError("Informe o nome do negócio.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ businessName: businessName.trim() });
      enter("business");
    } catch {
      setError("Não foi possível salvar o nome do negócio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page workspace-picker">
      <div className="page-header">
        <h1>Onde você quer entrar?</h1>
      </div>
      <div className="workspace-cards">
        <button type="button" className="card workspace-card" onClick={() => enter("personal")}>
          <h2>Pessoal</h2>
          <p className="empty-state">Suas finanças pessoais — transações, categorias e dashboard.</p>
        </button>

        {user?.businessName ? (
          <button type="button" className="card workspace-card" onClick={() => enter("business")}>
            <h2>Empresa</h2>
            <p className="empty-state">{user.businessName} — cálculo de CMV.</p>
          </button>
        ) : (
          <form className="card workspace-card workspace-card-setup" onSubmit={handleSetupBusiness}>
            <h2>Empresa</h2>
            <label>
              Nome do negócio
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Cavalieri"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              Salvar e entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
