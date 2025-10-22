
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const FilmReelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zM6 4v2h2V4H6zm0 4v2h2V8H6zm0 4v2h2v-2H6zm0 4v2h2v-2H6zm4-12v12h8V4h-8zm10 12v2h2v-2h-2zm0-4v2h2v-2h-2zm0-4v2h2V8h-2zm0-4v2h2V4h-2z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navLinkClasses = (view: View) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      currentView === view
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <FilmReelIcon className="h-8 w-8 text-amber-400" />
            <span className="ml-3 text-xl font-bold tracking-wider text-white">Edwin Bikes</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentView(View.Portfolio)} className={navLinkClasses(View.Portfolio)}>
              Portafolio
            </button>
            <button onClick={() => setCurrentView(View.AIEditor)} className={navLinkClasses(View.AIEditor)}>
              Editor IA
            </button>
            <button onClick={() => setCurrentView(View.AIVideoGenerator)} className={navLinkClasses(View.AIVideoGenerator)}>
              Video IA
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;