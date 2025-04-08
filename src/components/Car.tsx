import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CollisionEnterPayload } from '@react-three/rapier';
import { useGameStore } from '../store/gameStore';
import { Vector3 } from 'three';

export function Car() {
  const vehicle = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();
  const [health, setHealth] = useState(100);
  const updateScore = useGameStore(state => state.updateScore);
  const [lastCollisionTime, setLastCollisionTime] = useState(0);
  const [collisionParticles, setCollisionParticles] = useState<Array<{
    position: Vector3;
    velocity: Vector3;
    life: number;
  }>>([]);

  useFrame((state, delta) => {
    const { forward, backward, left, right, brake } = getKeys();
    
    if (!vehicle.current) return;

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 50 * (health / 100); // Speed affected by health
    const torqueStrength = 20 * (health / 100);
    const brakeStrength = 0.95;

    if (forward) {
      impulse.z -= impulseStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
    }
    if (left) {
      torque.y += torqueStrength;
    }
    if (right) {
      torque.y -= torqueStrength;
    }
    if (brake) {
      const velocity = vehicle.current.linvel();
      vehicle.current.setLinvel({ 
        x: velocity.x * brakeStrength,
        y: velocity.y,
        z: velocity.z * brakeStrength
      });
    }

    vehicle.current.applyImpulse(impulse, true);
    vehicle.current.applyTorqueImpulse(torque, true);

    // Health regeneration over time
    if (health < 100) {
      setHealth(prev => Math.min(prev + delta * 2, 100));
    }

    // Update collision particles
    setCollisionParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          position: particle.position.add(particle.velocity.multiplyScalar(delta)),
          velocity: particle.velocity.add(new Vector3(0, -9.8, 0).multiplyScalar(delta)),
          life: particle.life - delta
        }))
        .filter(particle => particle.life > 0)
    );
  });

  const handleCollision = (payload: CollisionEnterPayload) => {
    const currentTime = Date.now();
    if (currentTime - lastCollisionTime > 500) {
      setLastCollisionTime(currentTime);
      const damage = Math.random() * 10 + 5;
      setHealth(prev => Math.max(prev - damage, 0));
      updateScore(-Math.floor(damage));

      // Generate collision particles
      const collisionPoint = payload.manifold.contactPoint(0);
      const particleCount = 20;
      const newParticles = Array.from({ length: particleCount }, () => ({
        position: new Vector3(collisionPoint.x, collisionPoint.y, collisionPoint.z),
        velocity: new Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 5,
          (Math.random() - 0.5) * 5
        ),
        life: 1 + Math.random()
      }));
      setCollisionParticles(prev => [...prev, ...newParticles]);
    }
  };

  return (
    <>
      <RigidBody
        ref={vehicle}
        colliders="hull"
        position={[0, 1, 0]}
        mass={1}
        type="dynamic"
        onCollisionEnter={handleCollision}
      >
        {/* Car body */}
        <group>
          <mesh castShadow>
            <boxGeometry args={[2, 0.5, 4]} />
            <meshStandardMaterial color="red" />
          </mesh>
          {/* Cockpit */}
          <mesh castShadow position={[0, 0.4, -0.5]}>
            <boxGeometry args={[1.5, 0.4, 2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Wheels */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} castShadow position={[x, -0.25, z]}>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          ))}
          {/* Headlights */}
          {[[-0.8, 1.8], [0.8, 1.8]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff88" />
              </mesh>
              <pointLight
                intensity={1}
                distance={10}
                decay={2}
                color="#ffff88"
              />
            </group>
          ))}
        </group>

        {/* Health indicator */}
        <mesh position={[0, 1.5, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color={health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'} />
        </mesh>
      </RigidBody>

      {/* Collision particles */}
      {collisionParticles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={particle.life} />
        </mesh>
      ))}
    </>
  );
}