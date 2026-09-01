import React, { useState } from 'react';
import { Header, ExtendedView } from './components/layout/Header';
import { LobbyView } from './components/lobby/LobbyView';
import { BlackjackTable } from './components/blackjack/BlackjackTable';
import { PokerTable } from './components/poker/PokerTable';
import { BalatroTable } from './components/balatro/BalatroTable';
import { BuckshotTable } from './components/buckshot/BuckshotTable';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ExtendedView>('lobby');

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] text-[#EDEDED] antialiased select-none">
      <Header activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 flex flex-col">
        {activeView === 'lobby' && <LobbyView onSelectGame={setActiveView} />}
        {activeView === 'buckshot' && <BuckshotTable />}
        {activeView === 'blackjack' && <BlackjackTable isPro={false} />}
        {activeView === 'blackjack-pro' && <BlackjackTable isPro={true} />}
        {activeView === 'videopoker' && <PokerTable />}
        {activeView === 'balatro' && <BalatroTable />}
      </main>
    </div>
  );
};

export default App;
