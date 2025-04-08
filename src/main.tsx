import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KeyboardControls } from '@react-three/drei';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'brake', keys: ['Space'] },
      ]}>
      <App />
    </KeyboardControls>
  </StrictMode>
);