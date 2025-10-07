import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";

type AppState = "checking" | "login" | "permissions" | "dashboard";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    // Verificar si ya hay sesión activa en backend
    fetch("http://localhost:5000/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          // Si ya está logueado, mostrar primero pantalla de permisos
          setAppState("permissions");
        } else {
          setAppState("login");
        }
      })
      .catch(() => setAppState("login"));
  }, []);

  const handleAcceptPermissions = () => {
    setAppState("dashboard");
  };

  const handleLogout = () => {
    setAppState("login");
    // opcional: también puedes agregar fetch a /logout en el backend
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case "checking":
        return <p className="text-center mt-10">Verificando sesión...</p>;
      case "login":
        return <LoginScreen />;
      case "permissions":
        return <PermissionsScreen onAccept={handleAcceptPermissions} />;
      case "dashboard":
        return <Dashboard onLogout={handleLogout} />;
    }
  };

  return <div className="size-full">{renderCurrentScreen()}</div>;
}
