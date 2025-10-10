
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateVideoFromImage } from '../services/geminiService';
import Spinner from './Spinner';

const UploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
);

const FilmIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v2H4V5zm0 4h12v2H4V9zm0 4h12v2H4v-2z" clipRule="evenodd" />
    </svg>
);

const loadingMessages = [
    "Contactando al director de IA...",
    "El storyboard está en progreso...",
    "La IA está preparando la cámara...",
    "Renderizando los primeros fotogramas...",
    "Añadiendo efectos especiales...",
    "Esto puede tardar unos minutos, por favor espera...",
    "Finalizando el video...",
];

const AIVideoGenerator: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('anima esta imagen con una suave brisa que mece las hojas');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);
  
  const messageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 5000); // Change message every 5 seconds
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedVideoUrl(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalFile || !prompt) {
      setError('Por favor, sube una imagen y proporciona una instrucción.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalFile);
      reader.onloadend = async () => {
        const fileAsDataURL = reader.result as string;
        const base64Data = fileAsDataURL.split(',')[1];
        const downloadLink = await generateVideoFromImage(base64Data, originalFile.type, prompt);
        
        if (downloadLink) {
          setLoadingMessage("¡Casi listo! Descargando video...");
          const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
          if(!response.ok) {
            throw new Error(`Error al descargar el video: ${response.statusText}`);
          }
          const videoBlob = await response.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(videoUrl);
        } else {
          setError('La IA no pudo generar un video. Intenta con una instrucción o imagen diferente.');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error('Error al leer el archivo de imagen.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setIsLoading(false);
    }
  }, [originalFile, prompt]);

  return (
    <section>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-wide">Generador de Video con IA</h1>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
          Dale vida a tus imágenes. Sube una foto, describe la escena y deja que la IA genere un videoclip corto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Column */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-6">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Sube una Imagen</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {originalImage ? (
                  <img src={originalImage} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
                ) : (
                  <>
                    <UploadIcon />
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-amber-400 hover:text-amber-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-amber-500 px-2">
                        <span>Sube un archivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">2. Describe la Animación</label>
            <textarea
              id="prompt"
              rows={4}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white p-2"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ej., 'una toma de dron volando lentamente sobre el paisaje'"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !originalImage}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner /> : <FilmIcon />}
            {isLoading ? 'Generando...' : 'Generar Video'}
          </button>
        </div>

        {/* Output Column */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl h-full flex flex-col justify-center items-center min-h-[400px]">
          <h2 className="text-lg font-medium text-gray-300 mb-4">Resultado</h2>
          <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-md border-2 border-gray-700 border-dashed">
            {isLoading && (
              <div className="text-center">
                <Spinner large={true} />
                <p className="mt-4 text-amber-400">{loadingMessage}</p>
              </div>
            )}
            {error && <p className="text-red-400 text-center p-4">{error}</p>}
            {generatedVideoUrl && !isLoading && (
                <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-md" />
            )}
            {!isLoading && !generatedVideoUrl && !error && (
              <p className="text-gray-500">Tu video generado aparecerá aquí</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIVideoGenerator;
