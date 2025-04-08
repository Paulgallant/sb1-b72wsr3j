import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Car } from '../components/Car';
import { Canvas } from '@react-three/fiber';

// Mock the useFrame hook
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useFrame: vi.fn(),
  };
});

// Mock the useKeyboardControls hook
vi.mock('@react-three/drei', () => ({
  useKeyboardControls: () => [null, () => ({ forward: false, backward: false, left: false, right: false, brake: false })],
}));

describe('Car Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Canvas>
        <Car />
      </Canvas>
    );
    expect(container).toBeTruthy();
  });
});