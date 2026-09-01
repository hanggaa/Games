import React, { useState } from 'react';
import { Header, ExtendedView } from './components/layout/Header';
import { LobbyView } from './components/lobby/LobbyView';
import { DungeonTable } from './components/dungeon/DungeonTable';
import { DefenseTable } from './components/defense/DefenseTable';
import { CyberTable } from './components/cyber/CyberTable';
import { OrbitalTable } from './components/orbital/OrbitalTable';
import { BuckshotTable } from './components/buckshot/BuckshotTable';
import { BalatroTable } from './components/balatro/BalatroTable';
import { BlackjackTable } from './components/blackjack/BlackjackTable';
import { PokerTable } from './components/poker/PokerTable';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ExtendedView>('lobby');

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] text-[#EDEDED] antialiased select-none">
      <Header activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 flex flex-col">
        {activeView === 'lobby' && <LobbyView onSelectGame={setActiveView} />}
        {activeView === 'dungeon' && <DungeonTable />}
        {activeView === 'defense' && <DefenseTable />}
        {activeView === 'cyber' && <CyberTable />}
        {activeView === 'orbital' && <OrbitalTable />}
        {activeView === 'buckshot' && <BuckshotTable />}
        {activeView === 'balatro' && <BalatroTable />}
        {activeView === 'blackjack-pro' && <BlackjackTable isPro={true} />}
        {activeView === 'videopoker' && <PokerTable />}
        {activeView === 'blackjack' && <BlackjackTable isPro={false} />}
      </main>
    </div>
  );
};

export default App;
