import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CheckCircle, Mail, Users, Shield } from "lucide-react";

export function PermissionsScreen() {
  const [sessionActive, setSessionActive] = useState(false);
  const [checking, setChecking] = useState(true);

  // 🔍 Verifica sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("https://outlookbackend.onrender.com/session-check", {
          method: "GET",
          credentials: "include", // 👈 envía cookies de sesión
          headers: {
            "Accept": "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (!res.ok) {
          console.warn("⚠️ Respuesta inesperada:", res.status);
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        if (data?.token) {
          setSessionActive(true);
          console.log("✅ Sesión activa detectada en PermissionsScreen");
        } else {
          console.log("🚪 No hay sesión activa, redirigiendo al login...");
          window.location.href = "/";
        }
      } catch (err) {
        console.error("❌ Error comprobando sesión:", err);
        window.location.href = "/";
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  const permissions = [
    {
      icon: Mail,
      title: "Acceder a categorías del correo",
      description: "Leer y organizar las categorías configuradas en tu Outlook",
    },
    {
      icon: Users,
      title: "Acceder a contactos por categoría",
      description: "Visualizar y gestionar contactos organizados por categorías",
    },
    {
      icon: Shield,
      title: "Integración segura",
      description: "Conexión protegida con protocolos de seguridad Microsoft",
    },
  ];

  const handleAccept = () => {
    window.location.href = "/dashboard";
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <p className="animate-pulse text-lg">Verificando autenticación...</p>
      </div>
    );
  }

  if (!sessionActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-center p-6">
        <Card className="p-8 bg-white shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            No se encontró sesión activa
          </h2>
          <p className="text-slate-600 mb-4">
            Por favor, inicia sesión primero para continuar.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-[#0078d4] hover:bg-[#106ebe]"
          >
            Ir al inicio de sesión
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl text-slate-800 mb-2">
              Permisos de Acceso
            </h1>
            <p className="text-slate-600">
              Esta aplicación necesita los siguientes permisos para funcionar correctamente.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {permissions.map((p, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <p.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-slate-600 text-sm">{p.description}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              </div>
            ))}
          </div>

          <Button
            onClick={handleAccept}
            className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white py-3"
          >
            Aceptar y continuar
          </Button>
        </Card>
      </div>
    </div>
  );
}
