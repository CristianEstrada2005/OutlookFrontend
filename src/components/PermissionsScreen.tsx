import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CheckCircle, Mail, Users, Shield } from "lucide-react";

interface PermissionsScreenProps {
  onAccept?: () => void; // Hacemos opcional para manejar internamente la navegación
}

export function PermissionsScreen({ onAccept }: PermissionsScreenProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [checking, setChecking] = useState(true);

  // 🔍 Verifica si hay una sesión activa (usuario autenticado)
  useEffect(() => {
    fetch("https://outlookbackend.onrender.com/session-check", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setSessionActive(true);
        }
      })
      .catch((err) => console.error("Error comprobando sesión:", err))
      .finally(() => setChecking(false));
  }, []);

  // 📦 Lista de permisos que la app requiere
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
    if (onAccept) {
      onAccept();
    } else {
      // Si no se pasa una función externa, redirige por defecto al dashboard
      window.location.href = "/dashboard";
    }
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
              Esta aplicación necesita los siguientes permisos para funcionar correctamente
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {permissions.map((permission, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <permission.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-800 mb-1">{permission.title}</h3>
                  <p className="text-slate-600 text-sm">
                    {permission.description}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Nota de seguridad:</strong> Todos los datos se procesan de forma segura
              y no se almacenan permanentemente sin tu consentimiento.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#0078d4] hover:bg-[#106ebe] text-white py-3"
            >
              Aceptar y continuar
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
