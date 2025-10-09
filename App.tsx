
import React, { useState } from 'react';
import Header from './components/Header';
import Portfolio from './components/Portfolio';
import AIEditor from './components/AIEditor';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Portfolio);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-4 py-8">
        {currentView === View.Portfolio && <Portfolio />}
        {currentView === View.AIEditor && <AIEditor />}
      </main>
      <footer className="text-center py-6 border-t border-gray-800 text-gray-500">
        <p>&copy; 2024 Filmmaker Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
