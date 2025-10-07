import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle,
  Download,
  Eye,
  Users,
  Merge,
  Plus,
  AlertCircle,
  Loader2
} from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CourseManagementProps {
  onBack: () => void;
}

interface FileUpload {
  name: string;
  size: string;
  uploaded: boolean;
  records: number;
  file?: File;
}

export function CourseManagement({ onBack }: CourseManagementProps) {
  const [categoryName, setCategoryName] = useState("");
  const [file1, setFile1] = useState<FileUpload | null>(null);
  const [file2, setFile2] = useState<FileUpload | null>(null);
  const [mergedData, setMergedData] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'upload' | 'merge' | 'preview'>('setup');

  // Mock data para el archivo combinado
  const mockMergedData = [
    {
      id: '1',
      nombre: 'Ana García López',
      email: 'ana.garcia@estudiante.edu',
      curso: 'Ingeniería de Software',
      plataforma_a: 'Presente',
      plataforma_b: 'Activo',
      status: 'Unificado'
    },
    {
      id: '2', 
      nombre: 'Carlos Rodríguez Mesa',
      email: 'carlos.rodriguez@estudiante.edu',
      curso: 'Matemáticas Aplicadas',
      plataforma_a: 'Presente',
      plataforma_b: 'Inactivo',
      status: 'Pendiente'
    },
    {
      id: '3',
      nombre: 'Elena Martín Ruiz', 
      email: 'elena.martin@estudiante.edu',
      curso: 'Física Cuántica',
      plataforma_a: 'Ausente',
      plataforma_b: 'Activo',
      status: 'Conflicto'
    }
  ];

  const handleFileUpload = async (fileNumber: 1 | 2, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      
      try {
        // Simular procesamiento del archivo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fileData: FileUpload = {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploaded: true,
          records: Math.floor(Math.random() * 200) + 50,
          file: file
        };

        if (fileNumber === 1) {
          setFile1(fileData);
        } else {
          setFile2(fileData);
        }
        
        // Si ambos archivos están cargados, avanzar al siguiente paso
        if ((fileNumber === 1 && file2) || (fileNumber === 2 && file1)) {
          setCurrentStep('merge');
        }
      } catch (error) {
        console.error('Error al procesar archivo:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleMergeFiles = async () => {
    if (!file1 || !file2 || !categoryName.trim()) return;
    
    setIsProcessing(true);
    setCurrentStep('merge');
    
    try {
      // Crear FormData para enviar al servidor
      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('file1', file1.file!);
      formData.append('file2', file2.file!);
      
      // Llamar al backend para procesar y unificar archivos
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1227e06f/merge-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Archivos unificados exitosamente:', result);
        setMergedData(result.data);
        setCurrentStep('preview');
      } else {
        throw new Error(result.error || 'Error desconocido al unificar archivos');
      }
      
    } catch (error) {
      console.error('Error al unificar archivos:', error);
      alert(`Error al procesar archivos: ${error.message}`);
      // Volver al paso anterior en caso de error
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (!mergedData) return;
    
    // Convertir datos a CSV con encabezados más descriptivos
    const headers = ['Nombre Completo', 'Email Institucional', 'Categoría', 'Estado Plataforma A', 'Estado Plataforma B', 'Estado Unificación', 'Fecha Procesamiento'];
    const csvContent = [
      headers.join(','),
      ...mergedData.map(row => [
        `"${row.nombre}"`,
        `"${row.email}"`,
        `"${categoryName}"`,
        `"${row.plataforma_a}"`,
        `"${row.plataforma_b}"`,
        `"${row.status}"`,
        `"${new Date().toLocaleDateString('es-ES')}"`
      ].join(','))
    ].join('\n');
    
    // Descargar CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${categoryName.replace(/\s+/g, '_').toLowerCase()}_estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    console.log(`CSV exportado: ${categoryName} con ${mergedData.length} registros`);
  };

  const handleCreateCategory = async () => {
    if (!mergedData || !categoryName.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Llamar al backend para crear la categoría en Outlook
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1227e06f/create-outlook-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          categoryName,
          studentData: mergedData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Categoría creada exitosamente:', result);
        alert(result.message);
        
        // Resetear el formulario
        setCategoryName("");
        setFile1(null);
        setFile2(null);
        setMergedData(null);
        setCurrentStep('setup');
      } else {
        throw new Error(result.error || 'Error desconocido al crear categoría');
      }
      
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert(`Error al crear categoría en Outlook: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setCategoryName("");
    setFile1(null);
    setFile2(null);
    setMergedData(null);
    setCurrentStep('setup');
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'setup': return 25;
      case 'upload': return 50;
      case 'merge': return 75;
      case 'preview': return 100;
      default: return 0;
    }
  };

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
          <div>
            <h1 className="text-2xl text-slate-800">Crear Nueva Categoría</h1>
            <p className="text-slate-600">Unifica estudiantes de dos plataformas universitarias en una categoría de Outlook</p>
          </div>
        </div>
        {currentStep !== 'setup' && (
          <Button 
            variant="outline" 
            onClick={handleStartOver}
            disabled={isProcessing}
          >
            Comenzar de nuevo
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Progreso</span>
          <span className="text-sm text-slate-600">{getStepProgress()}%</span>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span className={currentStep === 'setup' ? 'text-blue-600' : ''}>Configuración</span>
          <span className={currentStep === 'upload' ? 'text-blue-600' : ''}>Carga de archivos</span>
          <span className={currentStep === 'merge' ? 'text-blue-600' : ''}>Unificación</span>
          <span className={currentStep === 'preview' ? 'text-blue-600' : ''}>Resultado</span>
        </div>
      </Card>

      {/* Paso 1: Configuración de Categoría */}
      {currentStep === 'setup' && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg text-slate-800">Nueva Categoría de Estudiantes</h2>
              <p className="text-slate-600 text-sm">Define el nombre de la categoría que se creará en Outlook</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nombre de la categoría</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ej: Ingeniería de Software 2024-1, Matemáticas Avanzadas..."
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Este nombre se usará para crear la categoría en Outlook y aparecerá en los reportes
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-blue-800 mb-1">¿Qué sucederá después?</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Cargarás archivos Excel de dos plataformas universitarias</li>
                    <li>• El sistema unificará automáticamente los datos de estudiantes</li>
                    <li>• Podrás exportar un CSV y crear una categoría en Outlook</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep('upload')}
              disabled={!categoryName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuar con la carga de archivos
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 2: Carga de Archivos */}
      {currentStep === 'upload' && (
        <div>
          <Card className="p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg text-slate-800 mb-2">Categoría: "{categoryName}"</h2>
              <p className="text-slate-600 text-sm">
                Carga los archivos Excel de ambas plataformas universitarias
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sección API 1 */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg text-slate-800">Plataforma Universitaria A</h2>
                  <p className="text-slate-600 text-sm">Sistema de gestión académica principal</p>
                </div>
              </div>

              {!file1 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                      <h3 className="text-slate-700 mb-2">Procesando archivo...</h3>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-slate-700 mb-2">Subir archivo Excel</h3>
                      <p className="text-slate-500 text-sm mb-4">
                        Formatos aceptados: .xlsx, .xls, .csv
                      </p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleFileUpload(1, e)}
                        className="hidden"
                        id="file1"
                        disabled={isProcessing}
                      />
                      <label htmlFor="file1">
                        <Button variant="outline" className="cursor-pointer" disabled={isProcessing}>
                          Seleccionar archivo
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="text-green-800">{file1.name}</h3>
                        <p className="text-green-600 text-sm">
                          {file1.size} • {file1.records} registros detectados
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile1(null)}
                      disabled={isProcessing}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Sección API 2 */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg text-slate-800">Plataforma Universitaria B</h2>
                  <p className="text-slate-600 text-sm">Sistema de evaluación y seguimiento</p>
                </div>
              </div>

              {!file2 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                      <h3 className="text-slate-700 mb-2">Procesando archivo...</h3>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-slate-700 mb-2">Subir archivo Excel</h3>
                      <p className="text-slate-500 text-sm mb-4">
                        Formatos aceptados: .xlsx, .xls, .csv
                      </p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleFileUpload(2, e)}
                        className="hidden"
                        id="file2"
                        disabled={isProcessing}
                      />
                      <label htmlFor="file2">
                        <Button variant="outline" className="cursor-pointer" disabled={isProcessing}>
                          Seleccionar archivo
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="text-green-800">{file2.name}</h3>
                        <p className="text-green-600 text-sm">
                          {file2.size} • {file2.records} registros detectados
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile2(null)}
                      disabled={isProcessing}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Paso 3: Unificación */}
      {currentStep === 'merge' && file1 && file2 && !mergedData && (
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              ) : (
                <Merge className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <h2 className="text-xl text-slate-800 mb-2">
              {isProcessing ? 'Unificando archivos...' : 'Archivos listos para unificar'}
            </h2>
            <p className="text-slate-600 mb-6">
              Categoría: "{categoryName}" • {file1.records + file2.records} registros en total
            </p>
            
            {isProcessing ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  Procesando y unificando datos de estudiantes...
                </div>
                <Progress value={66} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <Button 
                onClick={handleMergeFiles}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              >
                <Merge className="w-4 h-4 mr-2" />
                Unificar archivos
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Mostrar botón de unificar cuando ambos archivos estén cargados en el paso de upload */}
      {currentStep === 'upload' && file1 && file2 && (
        <Card className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg text-slate-800 mb-2">Archivos cargados correctamente</h3>
            <p className="text-slate-600 mb-4">
              {file1.records + file2.records} registros listos para unificar
            </p>
            <Button 
              onClick={handleMergeFiles}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Merge className="w-4 h-4 mr-2" />
              Proceder a unificar
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 4: Resultado y Export */}
      {currentStep === 'preview' && mergedData && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl text-slate-800 mb-1">Categoría: "{categoryName}"</h2>
                <p className="text-slate-600">
                  {mergedData.length} estudiantes unificados de ambas plataformas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isProcessing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Creando categoría...' : 'Crear categoría en Outlook'}
                </Button>
              </div>
            </div>

            {/* Tabla de previsualización */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-slate-600">Estudiante</th>
                    <th className="text-left p-3 text-slate-600">Email Institucional</th>
                    <th className="text-left p-3 text-slate-600">Plataforma A</th>
                    <th className="text-left p-3 text-slate-600">Plataforma B</th>
                    <th className="text-left p-3 text-slate-600">Estado de Unificación</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedData.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div>
                          <div className="text-slate-800">{row.nombre}</div>
                          <div className="text-slate-500 text-sm">ID: {row.id}</div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{row.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.plataforma_a === 'Presente' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {row.plataforma_a}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.plataforma_b === 'Activo' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {row.plataforma_b}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.status === 'Unificado' 
                            ? 'bg-blue-100 text-blue-600' 
                            : row.status === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {mergedData.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-800 mb-1">No hay datos para mostrar</h3>
                <p className="text-slate-600 text-sm">
                  Parece que los archivos no contienen datos válidos
                </p>
              </div>
            )}
          </Card>

          {/* Estadísticas del merge */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl text-slate-800 mb-1">
                  {mergedData.length}
                </div>
                <p className="text-slate-600 text-sm">Total Registros</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl text-green-600 mb-1">
                  {mergedData.filter(r => r.status === 'Unificado').length}
                </div>
                <p className="text-slate-600 text-sm">Unificados</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl text-yellow-600 mb-1">
                  {mergedData.filter(r => r.status === 'Pendiente').length}
                </div>
                <p className="text-slate-600 text-sm">Pendientes</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl text-orange-600 mb-1">
                  {mergedData.filter(r => r.status === 'Conflicto').length}
                </div>
                <p className="text-slate-600 text-sm">Conflictos</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}