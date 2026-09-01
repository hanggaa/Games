import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { LobbyView } from './components/lobby/LobbyView';
import { BlackjackTable } from './components/blackjack/BlackjackTable';
import { PokerTable } from './components/videopoker/PokerTable';

type ActiveView = 'lobby' | 'blackjack' | 'blackjack-pro' | 'videopoker';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('lobby');

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-100 antialiased select-none">
      {/* Sticky Top Header */}
      <Header activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'lobby' && <LobbyView onSelectGame={setActiveView} />}
        {activeView === 'blackjack' && <BlackjackTable isPro={false} />}
        {activeView === 'blackjack-pro' && <BlackjackTable isPro={true} />}
        {activeView === 'videopoker' && <PokerTable />}
      </main>
    </div>
  );
};

export default App;
