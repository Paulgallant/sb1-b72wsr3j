import { RigidBody } from '@react-three/rapier';
import { useEffect, useState } from 'react';
import { Cloud, useGLTF, SpotLight, PointLight } from '@react-three/drei';
import { Color } from 'three';

type WeatherCondition = 'sunny' | 'rainy' | 'cloudy';
type DayTime = 'day' | 'night';
type TrafficLightState = 'red' | 'yellow' | 'green';

export function Track() {
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [dayTime, setDayTime] = useState<DayTime>('day');
  const [trafficLights, setTrafficLights] = useState<TrafficLightState>('red');
  const [obstacles, setObstacles] = useState<Array<{ position: [number, number, number], type: string }>>([]);

  useEffect(() => {
    // Weather changes every 30 seconds
    const weatherInterval = setInterval(() => {
      const conditions: WeatherCondition[] = ['sunny', 'rainy', 'cloudy'];
      setWeather(conditions[Math.floor(Math.random() * conditions.length)]);
    }, 30000);

    // Day/Night cycle every 2 minutes
    const dayNightInterval = setInterval(() => {
      setDayTime(prev => prev === 'day' ? 'night' : 'day');
    }, 120000);

    // Traffic light changes
    const trafficInterval = setInterval(() => {
      setTrafficLights(prev => {
        switch(prev) {
          case 'red': return 'green';
          case 'green': return 'yellow';
          case 'yellow': return 'red';
          default: return 'red';
        }
      });
    }, 5000);

    // Generate random obstacles
    const roadObstacles = Array.from({ length: 15 }, () => ({
      position: [
        Math.random() * 80 - 40,
        0.5,
        Math.random() * 80 - 40
      ] as [number, number, number],
      type: Math.random() > 0.5 ? 'roadwork' : 'bump'
    }));
    setObstacles(roadObstacles);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(dayNightInterval);
      clearInterval(trafficInterval);
    };
  }, []);

  const ambientIntensity = dayTime === 'day' ? 0.5 : 0.1;
  const streetLightIntensity = dayTime === 'day' ? 0.1 : 1;

  return (
    <>
      {/* Main road surface */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#303030"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Newcastle-inspired landmarks */}
        {/* Tyne Bridge */}
        <group position={[0, 0, -40]}>
          <mesh castShadow position={[0, 15, 0]}>
            <cylinderGeometry args={[1, 1, 30, 16]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
          </mesh>
          {/* Bridge arch */}
          <mesh castShadow position={[0, 25, 0]}>
            <torusGeometry args={[20, 1, 16, 100, Math.PI]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
          </mesh>
        </group>

        {/* St. James' Park Stadium */}
        <group position={[-30, 0, -30]}>
          <mesh castShadow>
            <boxGeometry args={[40, 25, 30]} />
            <meshStandardMaterial color="#d4d4d4" />
          </mesh>
          {/* Stadium roof */}
          <mesh castShadow position={[0, 12.5, 0]}>
            <cylinderGeometry args={[20, 20, 2, 4]} />
            <meshStandardMaterial color="#a0a0a0" />
          </mesh>
        </group>

        {/* Grey Street buildings */}
        <group position={[-20, 0, -20]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} castShadow position={[i * 8, 7, 0]}>
              <boxGeometry args={[7, 14, 10]} />
              <meshStandardMaterial color="#d4d4d4" />
              {/* Victorian details */}
              <mesh position={[0, 5, 5.1]}>
                <boxGeometry args={[5, 2, 0.2]} />
                <meshStandardMaterial color="#c0c0c0" />
              </mesh>
            </mesh>
          ))}
        </group>

        {/* Quayside buildings and Millennium Bridge */}
        <group position={[20, 0, 20]}>
          {/* Modern buildings */}
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} castShadow position={[i * 10, 10, 0]}>
              <boxGeometry args={[8, 20, 12]} />
              <meshStandardMaterial 
                color="#a3a3a3"
                metalness={0.6}
                roughness={0.2}
              />
              {/* Glass windows */}
              <mesh position={[0, 0, 6.1]}>
                <planeGeometry args={[7, 18]} />
                <meshStandardMaterial 
                  color="#4a87a3"
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            </mesh>
          ))}
          
          {/* Millennium Bridge */}
          <group position={[20, 5, -10]}>
            <mesh castShadow>
              <torusGeometry args={[15, 0.5, 16, 100, Math.PI]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Traffic Lights */}
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={i} position={[20 * Math.cos(i * Math.PI/2), 3, 20 * Math.sin(i * Math.PI/2)]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
            <group position={[0, 2, 0]}>
              <mesh>
                <boxGeometry args={[1, 2.5, 0.5]} />
                <meshStandardMaterial color="#222222" />
              </mesh>
              {/* Traffic light bulbs */}
              <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial 
                  emissive={new Color(trafficLights === 'red' ? '#ff0000' : '#330000')}
                  emissiveIntensity={trafficLights === 'red' ? 1 : 0.1}
                />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial 
                  emissive={new Color(trafficLights === 'yellow' ? '#ffff00' : '#333300')}
                  emissiveIntensity={trafficLights === 'yellow' ? 1 : 0.1}
                />
              </mesh>
              <mesh position={[0, -0.8, 0]}>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial 
                  emissive={new Color(trafficLights === 'green' ? '#00ff00' : '#003300')}
                  emissiveIntensity={trafficLights === 'green' ? 1 : 0.1}
                />
              </mesh>
            </group>
          </group>
        ))}

        {/* Street Lights */}
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={i} position={[25 * Math.cos(i * Math.PI/4), 0, 25 * Math.sin(i * Math.PI/4)]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.3, 8, 8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            <group position={[0, 8, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
                <meshStandardMaterial 
                  color="#ffff88"
                  emissive="#ffff88"
                  emissiveIntensity={streetLightIntensity}
                />
              </mesh>
              <pointLight
                intensity={streetLightIntensity * 0.5}
                distance={15}
                decay={2}
                color="#ffff88"
              />
            </group>
          </group>
        ))}

        {/* Road obstacles */}
        {obstacles.map((obstacle, index) => (
          <group key={index} position={obstacle.position}>
            {obstacle.type === 'roadwork' ? (
              <>
                <mesh castShadow>
                  <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                  <meshStandardMaterial color="orange" />
                </mesh>
                <mesh castShadow position={[0, 0.6, 0]}>
                  <boxGeometry args={[0.8, 0.2, 0.1]} />
                  <meshStandardMaterial color="#ff4444" />
                </mesh>
                {/* Warning light */}
                <pointLight
                  position={[0, 1, 0]}
                  intensity={0.5}
                  distance={5}
                  color="orange"
                />
              </>
            ) : (
              <mesh castShadow>
                <boxGeometry args={[2, 0.3, 1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            )}
          </group>
        ))}
      </RigidBody>

      {/* Dynamic ambient lighting */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Sun/Moon */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={dayTime === 'day' ? 1 : 0.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Weather effects */}
      {weather === 'cloudy' && (
        <>
          <Cloud position={[-10, 15, 0]} speed={0.2} opacity={0.5} />
          <Cloud position={[10, 18, -10]} speed={0.1} opacity={0.7} />
          <Cloud position={[0, 20, 10]} speed={0.3} opacity={0.6} />
        </>
      )}
      {weather === 'rainy' && (
        <mesh position={[0, 20, 0]}>
          <RainFX />
        </mesh>
      )}
    </>
  );
}

// Rain particle effect
function RainFX() {
  const count = 1000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = Math.random() * 100 - 50;
    positions[i + 1] = Math.random() * 20;
    positions[i + 2] = Math.random() * 100 - 50;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}