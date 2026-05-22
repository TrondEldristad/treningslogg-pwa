import { useState } from 'react';
import type { Tab } from './types';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import ProfileSelector from './components/ProfileSelector';
import BottomNav from './components/BottomNav';
import LogView from './views/LogView';
import OverviewView from './views/OverviewView';
import SettingsView from './views/SettingsView';

function AppContent() {
  const { activeProfile, setActiveProfile } = useProfile();
  const [tab, setTab] = useState<Tab>('log');

  if (!activeProfile) {
    return <ProfileSelector onSelect={setActiveProfile} />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] max-w-lg mx-auto pt-safe">
      <div className="pb-24">
        {tab === 'log' && <LogView userName={activeProfile} onSwitchProfile={() => setActiveProfile(null)} />}
        {tab === 'overview' && <OverviewView userName={activeProfile} onSwitchProfile={() => setActiveProfile(null)} />}
        {tab === 'settings' && <SettingsView userName={activeProfile} onSwitchProfile={() => setActiveProfile(null)} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}
