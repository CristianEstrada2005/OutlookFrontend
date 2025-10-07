import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone,
  User
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

export function CategoryView({ category, onBack }: CategoryViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar contactos desde la API por categoría
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("http://localhost:5000/contacts-by-category", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const contactsFromCategory = data[category.name] || [];
          const mappedContacts = contactsFromCategory.map((c: any, idx: number) => ({
            id: c.id || idx.toString(),
            name: c.displayName || "Sin nombre",
            email: c.emailAddresses?.[0]?.address || "Sin email",
            phone: c.mobilePhone || c.businessPhones?.[0] || "",
            department: c.department || "",
          }));
          setContacts(mappedContacts);
        } else {
          console.error("Error al cargar contactos desde la API");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [category]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.department && contact.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        <p className="animate-pulse">Cargando contactos de {category.name}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
            <div>
              <h1 className="text-2xl text-slate-800">{category.name}</h1>
              <p className="text-slate-600">{contacts.length} contactos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar contactos por nombre, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de contactos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-slate-800">Contactos</h2>
          <p className="text-slate-600 text-sm">
            Mostrando {filteredContacts.length} de {contacts.length}
          </p>
        </div>

        {filteredContacts.length > 0 ? (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-800">{contact.name}</h3>
                    <p className="text-slate-600 text-sm">{contact.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-slate-800 mb-1">No se encontraron contactos</h3>
            <p className="text-slate-600 text-sm">
              Intenta modificar los términos de búsqueda
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
