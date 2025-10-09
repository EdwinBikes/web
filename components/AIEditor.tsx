
import React, { useState, useCallback } from 'react';
import { editImageWithAI } from '../services/geminiService';
import Spinner from './Spinner';

const UploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
);

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.036a1 1 0 01.373.766l.096.48a1 1 0 00.92.836h.482a1 1 0 01.766.372l.48.097a1 1 0 01.836.92v.482a1 1 0 01-.372.766l-.097.48a1 1 0 00-.836.92h-.482a1 1 0 01-.766.372l-.48.097a1 1 0 01-.92.836v.482a1 1 0 01-.766.372l-.48.097a1 1 0 01-.836-.92v-.482a1 1 0 00-.92-.836h-.482a1 1 0 01-.766-.372l-.48-.097a1 1 0 01-.836-.92v-.482a1 1 0 01.372-.766l.097-.48a1 1 0 00.836-.92h.482a1 1 0 01.766-.372l.48-.097a1 1 0 01.92-.836V2a1 1 0 01.7-.954zM4.75 9.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zM4.5 13.5a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM9.25 15.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zM13.5 15a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01z" clipRule="evenodd" />
    </svg>
);

const AIEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('cinematic color grading, warm tones, high contrast');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = useCallback(async () => {
    if (!originalFile || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onloadend = async () => {
            const fileAsDataURL = reader.result as string;
            const base64Data = fileAsDataURL.split(',')[1];
            const result = await editImageWithAI(base64Data, originalFile.type, prompt);
            if(result){
                setEditedImage(result);
            } else {
                setError('The AI could not generate an image. Try a different prompt.');
            }
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError('Failed to read the image file.');
            setIsLoading(false);
        }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  }, [originalFile, prompt]);

  return (
    <section>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-wide">AI Image Editor</h1>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
          Transform your images with AI. Provide an image and describe the changes you want in color, lighting, or composition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Column */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-6">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {originalImage ? (
                  <img src={originalImage} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
                ) : (
                  <>
                    <UploadIcon />
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-amber-400 hover:text-amber-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-amber-500 px-2">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">2. Describe Your Edit</label>
            <textarea
              id="prompt"
              rows={4}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white p-2"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Make the scene look like it's at sunset with golden light'"
            />
          </div>

          <button
            onClick={handleEdit}
            disabled={isLoading || !originalImage}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner /> : <WandIcon />}
            {isLoading ? 'Editing...' : 'Generate Edit'}
          </button>
        </div>

        {/* Output Column */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl h-full flex flex-col justify-center items-center min-h-[400px]">
          <h2 className="text-lg font-medium text-gray-300 mb-4">Result</h2>
          <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-md border-2 border-gray-700 border-dashed">
            {isLoading && <Spinner large={true} />}
            {error && <p className="text-red-400 text-center p-4">{error}</p>}
            {editedImage && !isLoading && (
              <img src={editedImage} alt="Edited result" className="max-w-full max-h-full object-contain rounded-md" />
            )}
            {!isLoading && !editedImage && !error && (
              <p className="text-gray-500">Your edited image will appear here</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIEditor;
