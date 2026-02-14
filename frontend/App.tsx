import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
// import { Library } from './components/Library';
// import { Statistics } from './components/Statistics';
// import { Social } from './components/Social';
// import { Settings } from './components/Settings';

type View = 'dashboard' | 'library' | 'statistics' | 'social' | 'settings';

const API_BASE_URL = 'http://localhost:8000';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      // case 'library': return <Library />;
      // case 'statistics': return <Statistics />;
      // case 'social': return <Social />;
      // case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
