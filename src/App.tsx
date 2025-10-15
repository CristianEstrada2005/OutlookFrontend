import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";

type AppState = "checking" | "login" | "permissions" | "dashboard";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  // 🌐 Backend desplegado en Render
  const API_URL = "https://outlookbackend.onrender.com";

  useEffect(() => {
    // 🔍 Verificar si ya hay sesión activa en backend
    fetch(`${API_URL}/me`, {
      method: "GET",
      credentials: "include", // 👈 Envía cookies de sesión
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ Sesión activa detectada, mostrando permisos");
          setAppState("permissions");
        } else {
          console.log("🚪 No hay sesión activa, mostrando login");
          setAppState("login");
        }
      })
      .catch((err) => {
        console.error("❌ Error verificando sesión:", err);
        setAppState("login");
      });
  }, []);

  // 🧩 Cuando el usuario acepta los permisos
  const handleAcceptPermissions = () => {
    setAppState("dashboard");
  };

  // 🚪 Cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      console.log("👋 Sesión cerrada, volviendo al login");
      setAppState("login");
    }
  };

  // 🎨 Renderiza la pantalla según el estado actual
  const renderCurrentScreen = () => {
    switch (appState) {
      case "checking":
        return <p className="text-center mt-10 animate-pulse">Verificando sesión...</p>;
      case "login":
        return <LoginScreen />;
      case "permissions":
        return <PermissionsScreen onAccept={handleAcceptPermissions} />;
      case "dashboard":
        return <Dashboard onLogout={handleLogout} />;
      default:
        return <p className="text-center mt-10 text-red-500">Error: estado desconocido</p>;
    }
  };

  return <div className="size-full">{renderCurrentScreen()}</div>;
}
