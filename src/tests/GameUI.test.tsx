import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameUI } from '../components/GameUI';

// Mock the game store
vi.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    score: 1000,
    timeRemaining: 300,
    position: 1,
    updateTime: vi.fn(),
  }),
}));

describe('GameUI Component', () => {
  it('renders game information correctly', () => {
    render(<GameUI />);
    
    // Check if score is displayed
    expect(screen.getByText(/Geordie Notes: 1000/)).toBeTruthy();
    
    // Check if position is displayed
    expect(screen.getByText(/Position: 1\/10/)).toBeTruthy();
    
    // Check if time is displayed (5:00 format)
    expect(screen.getByText(/Time: 5:00/)).toBeTruthy();
  });
});