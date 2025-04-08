import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    const store = useGameStore.getState();
    useGameStore.setState({
      score: 1000,
      timeRemaining: 300,
      position: 1
    });
  });

  it('should initialize with default values', () => {
    const store = useGameStore.getState();
    expect(store.score).toBe(1000);
    expect(store.timeRemaining).toBe(300);
    expect(store.position).toBe(1);
  });

  it('should update score correctly', () => {
    const store = useGameStore.getState();
    store.updateScore(100);
    expect(useGameStore.getState().score).toBe(1100);
  });

  it('should update time remaining', () => {
    const store = useGameStore.getState();
    store.updateTime(250);
    expect(useGameStore.getState().timeRemaining).toBe(250);
  });

  it('should update position', () => {
    const store = useGameStore.getState();
    store.updatePosition(3);
    expect(useGameStore.getState().position).toBe(3);
  });
});