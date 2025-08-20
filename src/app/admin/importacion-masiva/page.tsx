'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface ProductPreview {
  name: string;
  price: number;
  category: string;
  subcategory: string;
  stock: number;
  imageName: string;
  imageUrl?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function ImportacionMasivaPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [csvData, setCsvData] = useState<ProductPreview[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps: UploadStep[] = [
    {
      id: 1,
      title: 'Subir CSV',
      description: 'Cargar archivo con datos de productos',
      completed: csvData.length > 0,
      current: currentStep === 1
    },
    {
      id: 2,
      title: 'Subir Imágenes',
      description: 'Cargar carpeta con imágenes de productos',
      completed: Object.keys(uploadedImages).length > 0,
      current: currentStep === 2
    },
    {
      id: 3,
      title: 'Revisar y Mapear',
      description: 'Verificar datos y mapear imágenes',
      completed: false,
      current: currentStep === 3
    },
    {
      id: 4,
      title: 'Importar Productos',
      description: 'Crear productos en la base de datos',
      completed: false,
      current: currentStep === 4
    }
  ];

  const handleCsvUpload = (data: ProductPreview[]) => {
    setCsvData(data);
    setCurrentStep(2);
  };

  const handleImagesUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'productos');
      
      const response = await fetch('/api/upload-bulk', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error subiendo imágenes');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const imageMap: { [key: string]: string } = {};
        result.results.uploads.forEach((upload: any) => {
          imageMap[upload.originalName] = upload.url;
        });
        
        setUploadedImages(imageMap);
        setCurrentStep(3);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error subiendo imágenes: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMappingComplete = () => {
    setCurrentStep(4);
  };

  const handleImportProducts = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const validProducts = csvData.filter(product => 
        uploadedImages[product.imageName]
      );
      
                    const productsToImport = validProducts.map(product => ({
         name: product.name,
         price: product.price,
         stock: product.stock,
         category: product.category,
         subcategory: product.subcategory,
         imageUrl: uploadedImages[product.imageName]
       }));
       
       // Debug: Log de datos a enviar
       console.log('=== DATOS A IMPORTAR ===');
       console.log('Productos válidos:', validProducts.length);
       console.log('Productos a importar:', productsToImport);
       
               const response = await fetch('/api/productos-bulk-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: productsToImport
        })
      });
      
      if (!response.ok) {
        throw new Error('Error creando productos');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUploadProgress(100);
        alert(`¡Importación exitosa! Se crearon ${result.results.successful} productos.`);
        // Resetear para nueva importación
        setCsvData([]);
        setUploadedImages({});
        setCurrentStep(1);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error importando productos: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Importación Masiva de Productos
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Importa cientos de productos de una vez usando CSV e imágenes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Mobile: Vertical layout */}
          <div className="block sm:hidden space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-semibold ${
                    step.current ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`font-semibold ${
                    step.current ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {currentStep === 1 && (
            <CsvUploadStep onComplete={handleCsvUpload} />
          )}
          
          {currentStep === 2 && (
            <ImageUploadStep onComplete={handleImagesUpload} />
          )}
          
          {currentStep === 3 && (
            <MappingStep 
              csvData={csvData}
              uploadedImages={uploadedImages}
              onComplete={handleMappingComplete}
            />
          )}
          
          {currentStep === 4 && (
            <ImportStep 
              csvData={csvData}
              uploadedImages={uploadedImages}
              onImport={handleImportProducts}
              isUploading={isUploading}
              progress={uploadProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para subir CSV
function CsvUploadStep({ onComplete }: { onComplete: (data: ProductPreview[]) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        processCsvFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processCsvFile(selectedFile);
    }
  };

  const processCsvFile = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
             const products: ProductPreview[] = lines.slice(1)
         .filter(line => line.trim())
         .map(line => {
           const values = line.split(',').map(v => v.trim());
           return {
             name: values[0] || '',
             price: parseFloat(values[1]) || 0,
             category: values[2] || '',
             subcategory: values[3] || '',
             stock: parseInt(values[4]) || 0,
             imageName: values[5] || '',
             status: 'pending' as const
           };
         });
      
      onComplete(products);
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="text-center">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        Paso 1: Subir archivo CSV
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
        Arrastra tu archivo CSV aquí o haz clic para seleccionarlo
      </p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-2 px-2">
            {file ? file.name : 'Arrastra tu archivo CSV aquí'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            o haz clic para seleccionar archivo
          </p>
        </label>
      </div>
      
      {file && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center sm:justify-start">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-700 text-center sm:text-left break-all">
              Archivo CSV cargado correctamente: {file.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para subir imágenes
function ImageUploadStep({ onComplete }: { onComplete: (files: File[]) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => 
        file.type.startsWith('image/') || 
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      setUploadedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => 
        file.type.startsWith('image/') || 
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      setUploadedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleUpload = async () => {
    onComplete(uploadedFiles);
  };

  return (
    <div className="text-center">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        Paso 2: Subir imágenes de productos
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
        Arrastra la carpeta con todas las imágenes aquí
      </p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Image className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-2 px-2">
            Arrastra las imágenes aquí
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            o haz clic para seleccionar archivos
          </p>
        </label>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
            Imágenes cargadas ({uploadedFiles.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 mb-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                  <Image className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 truncate px-1">{file.name}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Continuar con {uploadedFiles.length} imágenes
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para mapeo
function MappingStep({ 
  csvData, 
  uploadedImages, 
  onComplete 
}: { 
  csvData: ProductPreview[];
  uploadedImages: { [key: string]: string };
  onComplete: () => void;
}) {
  const [mappedProducts, setMappedProducts] = useState<ProductPreview[]>([]);

  // Mapear automáticamente por nombre de archivo
  useEffect(() => {
    const mapped = csvData.map(product => ({
      ...product,
      imageUrl: uploadedImages[product.imageName] || undefined,
      status: (uploadedImages[product.imageName] ? 'success' : 'error') as 'success' | 'error'
    }));
    setMappedProducts(mapped);
  }, [csvData, uploadedImages]);

  const validProducts = mappedProducts.filter(p => p.status === 'success');
  const invalidProducts = mappedProducts.filter(p => p.status === 'error');

  return (
    <div>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
        Paso 3: Revisar y mapear productos
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />
            <span className="text-sm sm:text-base font-medium text-green-700">
              Productos válidos: {validProducts.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-green-600">
            Estos productos tienen imagen y datos completos
          </p>
        </div>
        
        {invalidProducts.length > 0 && (
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <span className="text-sm sm:text-base font-medium text-red-700">
                Productos con problemas: {invalidProducts.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-600">
              Faltan imágenes para estos productos
            </p>
          </div>
        )}
      </div>

      {/* Mobile: Card view */}
      <div className="block sm:hidden max-h-96 overflow-y-auto space-y-3">
        {mappedProducts.map((product, index) => (
          <div key={index} className={`p-3 rounded-lg border ${
            product.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm text-gray-900 flex-1 mr-2">{product.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                product.status === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.status === 'success' ? '✅ Válido' : '❌ Sin imagen'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="font-medium">Precio:</span> ${product.price}</div>
              <div><span className="font-medium">Stock:</span> {product.stock}</div>
              <div><span className="font-medium">Categoría:</span> {product.category}</div>
              <div><span className="font-medium">Subcategoría:</span> {product.subcategory}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Imagen:</span> {product.imageName}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop: Table view */}
      <div className="hidden sm:block max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-left p-3">Subcategoría</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Imagen</th>
              <th className="text-left p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {mappedProducts.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{product.name}</td>
                <td className="p-3">${product.price}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">{product.subcategory}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">{product.imageName}</td>
                <td className="p-3">
                  {product.status === 'success' ? (
                    <span className="text-green-600">✅ Válido</span>
                  ) : (
                    <span className="text-red-600">❌ Sin imagen</span>
                  )}
                </td>
              </tr>
               ))}
             </tbody>
           </table>
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        {invalidProducts.length === 0 ? (
          <button
            onClick={onComplete}
            className="bg-green-600 text-white px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Continuar con {validProducts.length} productos
          </button>
        ) : (
          <div className="text-center">
            <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4 px-2">
              Corrige los productos sin imagen antes de continuar
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              Volver a empezar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para importación
function ImportStep({ 
  csvData, 
  uploadedImages, 
  onImport, 
  isUploading, 
  progress 
}: { 
  csvData: ProductPreview[];
  uploadedImages: { [key: string]: string };
  onImport: () => void;
  isUploading: boolean;
  progress: number;
}) {
  const validProducts = csvData.filter(product => 
    uploadedImages[product.imageName]
  );

  return (
    <div className="text-center">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        Paso 4: Importar productos
      </h2>
      
      <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-2">
          Resumen de importación
        </h3>
        <p className="text-sm sm:text-base text-blue-700">
          Se importarán <strong>{validProducts.length} productos</strong> con sus imágenes
        </p>
      </div>

      {!isUploading ? (
        <div>
          <button
            onClick={onImport}
            className="bg-blue-600 text-white px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Iniciar importación
          </button>
          
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 space-y-1">
            <p>• Los productos se crearán en tu catálogo</p>
            <p>• Las imágenes se almacenarán en Cloudflare R2</p>
            <p>• El proceso puede tomar varios minutos</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto animate-spin mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Importando productos...
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Progreso: {progress}%
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
            <div 
              className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            No cierres esta página durante la importación
          </p>
        </div>
      )}
    </div>
  );
}
