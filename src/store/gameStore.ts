import { create } from 'zustand';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  requires?: string[];
  demoOnly?: boolean;
  fullGameOnly?: boolean;
}

interface RaceBonus {
  type: 'position' | 'time' | 'style';
  amount: number;
  description: string;
}

interface GameState {
  score: number;
  timeRemaining: number;
  position: number;
  upgrades: Upgrade[];
  isDemo: boolean;
  demoTimeLimit: number;
  demoTrialEnded: boolean;
  racesCompleted: number;
  bestPosition: number;
  bestTime: number;
  bonuses: RaceBonus[];
  updateScore: (points: number) => void;
  updateTime: (time: number) => void;
  updatePosition: (pos: number) => void;
  unlockUpgrade: (id: string) => void;
  canUnlockUpgrade: (id: string) => boolean;
  endDemoTrial: () => void;
  completeRace: (position: number, time: number) => void;
  getBonuses: () => RaceBonus[];
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 1000,
  timeRemaining: 300,
  position: 1,
  isDemo: true,
  demoTimeLimit: 300,
  demoTrialEnded: false,
  racesCompleted: 0,
  bestPosition: 10,
  bestTime: 300,
  bonuses: [],
  upgrades: [
    // Steering upgrades
    {
      id: 'rope_steering',
      name: 'Rope Steering',
      description: 'Basic rope steering mechanism',
      cost: 200,
      unlocked: false,
      demoOnly: true
    },
    {
      id: 'steering_wheel',
      name: 'Steering Wheel',
      description: 'Professional steering wheel - Full Game Only',
      cost: 1000,
      unlocked: false,
      fullGameOnly: true,
      requires: ['rope_steering']
    },
    
    // Material upgrades - Body
    {
      id: 'wooden_body',
      name: 'Wooden Body',
      description: 'Basic wooden construction',
      cost: 300,
      unlocked: false,
      demoOnly: true
    },
    {
      id: 'metal_body',
      name: 'Metal Body',
      description: 'Sturdy metal construction - Full Game Only',
      cost: 800,
      unlocked: false,
      fullGameOnly: true,
      requires: ['wooden_body']
    },
    {
      id: 'carbon_fiber',
      name: 'Carbon Fiber Body',
      description: 'Premium carbon fiber construction - Full Game Only',
      cost: 2000,
      unlocked: false,
      fullGameOnly: true,
      requires: ['metal_body']
    },
    
    // Fasteners
    {
      id: 'nails',
      name: 'Nails',
      description: 'Basic nail fasteners',
      cost: 100,
      unlocked: false,
      demoOnly: true
    },
    {
      id: 'bolts',
      name: 'Bolts',
      description: 'Premium bolt fasteners',
      cost: 400,
      unlocked: false,
      demoOnly: true,
      requires: ['nails']
    },
    {
      id: 'premium_fasteners',
      name: 'Premium Fasteners',
      description: 'High-grade fastening system - Full Game Only',
      cost: 1200,
      unlocked: false,
      fullGameOnly: true,
      requires: ['bolts']
    },
    
    // Demo-only special items
    {
      id: 'demo_boost',
      name: 'Demo Boost Pack',
      description: 'Special demo-only speed boost - Try it now!',
      cost: 150,
      unlocked: false,
      demoOnly: true
    },
    {
      id: 'demo_paint',
      name: 'Demo Paint Job',
      description: 'Exclusive demo-only custom paint - Limited time!',
      cost: 250,
      unlocked: false,
      demoOnly: true
    }
  ],
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  updateTime: (time) => {
    const state = get();
    if (state.isDemo && time <= 0) {
      set({ timeRemaining: 0, demoTrialEnded: true });
    } else {
      set({ timeRemaining: time });
    }
  },
  updatePosition: (pos) => set({ position: pos }),
  unlockUpgrade: (id) => set((state) => ({
    upgrades: state.upgrades.map(upgrade =>
      upgrade.id === id ? { ...upgrade, unlocked: true } : upgrade
    ),
    score: state.score - (state.upgrades.find(u => u.id === id)?.cost || 0)
  })),
  canUnlockUpgrade: (id) => {
    const state = get();
    const upgrade = state.upgrades.find(u => u.id === id);
    if (!upgrade || upgrade.unlocked || state.score < upgrade.cost || state.demoTrialEnded) return false;
    
    // Prevent unlocking full game content in demo
    if (upgrade.fullGameOnly) return false;
    
    if (upgrade.requires) {
      return upgrade.requires.every(reqId => 
        state.upgrades.find(u => u.id === reqId)?.unlocked
      );
    }
    return true;
  },
  endDemoTrial: () => set({ demoTrialEnded: true }),
  completeRace: (position: number, time: number) => {
    const state = get();
    const newBonuses: RaceBonus[] = [];
    
    // Position bonuses
    if (position < state.bestPosition) {
      newBonuses.push({
        type: 'position',
        amount: (state.bestPosition - position) * 100,
        description: 'New Best Position!'
      });
      set({ bestPosition: position });
    }
    
    // Time bonuses
    if (time < state.bestTime) {
      newBonuses.push({
        type: 'time',
        amount: Math.floor((state.bestTime - time) * 2),
        description: 'New Best Time!'
      });
      set({ bestTime: time });
    }
    
    // Demo-specific bonuses
    if (state.isDemo) {
      // First race completion bonus
      if (state.racesCompleted === 0) {
        newBonuses.push({
          type: 'style',
          amount: 500,
          description: 'First Demo Race Completed!'
        });
      }
      
      // Top 3 position bonus in demo
      if (position <= 3) {
        newBonuses.push({
          type: 'position',
          amount: 300,
          description: 'Top 3 Demo Finish!'
        });
      }
    }
    
    // Apply all bonuses
    const totalBonus = newBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    set((state) => ({
      score: state.score + totalBonus,
      racesCompleted: state.racesCompleted + 1,
      bonuses: newBonuses
    }));
  },
  getBonuses: () => get().bonuses
}));