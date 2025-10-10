
import React, { useState } from 'react';
import Header from './components/Header';
import Portfolio from './components/Portfolio';
import AIEditor from './components/AIEditor';
import AIVideoGenerator from './components/AIVideoGenerator';
import Hero from './components/Hero';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Portfolio);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === View.Portfolio ? (
        <>
          <Hero />
          <main id="portfolio" className="container mx-auto px-4 py-16">
            <Portfolio />
          </main>
        </>
      ) : (
        <main className="container mx-auto px-4 py-8">
          {currentView === View.AIEditor && <AIEditor />}
          {currentView === View.AIVideoGenerator && <AIVideoGenerator />}
        </main>
      )}

      <footer className="text-center py-6 border-t border-gray-800 text-gray-500">
        <p>&copy; 2024 Portafolio de Cineasta. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
