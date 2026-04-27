'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ── Circuit ring: torus + instanced circuit details ─────────────── */
function CircuitRing({ radius = 2.2, tubeR = 0.04, angle = 0, rotSpeedZ = 0.2, color = '#f59e0b', detailCount = 40 }) {
  const groupRef = useRef();
  const detailRef = useRef();

  const { matrices, emissiveColor } = useMemo(() => {
    const mats = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < detailCount; i++) {
      const theta = (i / detailCount) * Math.PI * 2;
      const r = radius + tubeR;
      dummy.position.set(Math.cos(theta) * r, Math.sin(theta) * r, 0);
      const height = 0.03 + Math.random() * 0.18;
      const width = 0.025 + Math.random() * 0.06;
      dummy.rotation.set(0, 0, theta + Math.PI / 2);
      dummy.scale.set(width, height, 0.025);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
    }
    return { matrices: mats, emissiveColor: new THREE.Color(color) };
  }, [radius, tubeR, detailCount, color]);

  useEffect(() => {
    if (!detailRef.current) return;
    matrices.forEach((m, i) => detailRef.current.setMatrixAt(i, m));
    detailRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * rotSpeedZ;
  });

  return (
    <group ref={groupRef} rotation={[angle, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, tubeR, 8, 100]} />
        <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={2.5} metalness={0.6} roughness={0.3} />
      </mesh>
      <instancedMesh ref={detailRef} args={[null, null, detailCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={4} metalness={0.5} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}

/* ── Floating energy particles ───────────────────────────────────── */
function Particles({ count = 500 }) {
  const pointsRef = useRef();
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = Math.random() * 3 + 0.5;
    }
    return { positions: pos, sizes: sz };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial color="#f59e0b" size={0.018} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

/* ── Arc energy streams ──────────────────────────────────────────── */
function EnergyArcs() {
  const arcs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const points = [];
      const baseAngle = (i / 8) * Math.PI * 2;
      for (let j = 0; j <= 40; j++) {
        const t = j / 40;
        const angle = baseAngle + t * Math.PI * 0.7 + Math.sin(t * Math.PI) * 0.4;
        const r = 0.5 + Math.sin(t * Math.PI) * (1.2 + Math.random() * 0.5);
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          (Math.random() - 0.5) * 0.6
        ));
      }
      return new THREE.CatmullRomCurve3(points);
    });
  }, []);

  const meshRefs = useRef([]);

  useFrame((state) => {
    meshRefs.current.forEach((m, i) => {
      if (m) m.material.opacity = 0.3 + 0.5 * Math.abs(Math.sin(state.clock.elapsedTime * 1.2 + i * 0.8));
    });
  });

  return (
    <>
      {arcs.map((curve, i) => {
        const points = curve.getPoints(40);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} ref={el => meshRefs.current[i] = el} geometry={geo}>
            <lineBasicMaterial color="#fbbf24" transparent opacity={0.5} />
          </line>
        );
      })}
    </>
  );
}

/* ── Core ────────────────────────────────────────────────────────── */
function Core() {
  const coreRef = useRef();
  useFrame((state) => {
    if (coreRef.current) {
      const s = 1 + 0.12 * Math.sin(state.clock.elapsedTime * 2.4);
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* outer glow shell */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} transparent opacity={0.15} />
      </mesh>
      {/* main core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={6} metalness={0.3} roughness={0.1} />
      </mesh>
      {/* hot white center */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={20} />
      </mesh>
      {/* core light */}
      <pointLight color="#f59e0b" intensity={25} distance={8} decay={2} />
      <pointLight color="#ffffff" intensity={8} distance={2} decay={2} />
    </group>
  );
}

/* ── Outer housing ring ──────────────────────────────────────────── */
function HousingRing() {
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.6, 0.22, 16, 120]} />
        <meshStandardMaterial color="#1a0c00" metalness={0.95} roughness={0.15} emissive="#3d1a00" emissiveIntensity={0.3} />
      </mesh>
      {/* thin bright edge line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.6, 0.015, 8, 120]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} />
      </mesh>
    </>
  );
}

/* ── Main scene ──────────────────────────────────────────────────── */
function Scene({ mouseX, mouseY }) {
  const groupRef = useRef();
  const targetRot = useRef({ x: 0, y: 0 });

  useEffect(() => {
    targetRot.current.x = (mouseY - 0.5) * Math.PI * 0.55;
    targetRot.current.y = (mouseX - 0.5) * Math.PI * 0.55;
  }, [mouseX, mouseY]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += (targetRot.current.x - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.y += (targetRot.current.y - groupRef.current.rotation.y) * 0.06;
  });

  return (
    <>
      <ambientLight intensity={0.05} />
      <group ref={groupRef}>
        <HousingRing />
        {/* Gyroscope rings at different orbital angles */}
        <CircuitRing radius={2.8} tubeR={0.032} angle={0}              rotSpeedZ={0.12}  color="#d97706" detailCount={50} />
        <CircuitRing radius={2.8} tubeR={0.032} angle={Math.PI / 2}    rotSpeedZ={-0.09} color="#f59e0b" detailCount={50} />
        <CircuitRing radius={2.2} tubeR={0.025} angle={Math.PI / 3}    rotSpeedZ={0.18}  color="#ea580c" detailCount={38} />
        <CircuitRing radius={2.2} tubeR={0.025} angle={Math.PI * 2/3}  rotSpeedZ={-0.22} color="#fbbf24" detailCount={38} />
        <CircuitRing radius={1.5} tubeR={0.02}  angle={Math.PI / 5}    rotSpeedZ={0.32}  color="#f97316" detailCount={28} />
        <CircuitRing radius={1.5} tubeR={0.02}  angle={Math.PI * 4/5}  rotSpeedZ={-0.28} color="#fb923c" detailCount={28} />
        <EnergyArcs />
        <Particles count={600} />
        <Core />
      </group>
    </>
  );
}

/* ── Exported canvas component ───────────────────────────────────── */
export default function ReactorScene({ mouseX = 0.5, mouseY = 0.5, size = 420, fill = false }) {
  const containerStyle = fill
    ? {
        position: 'absolute', inset: 0,
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, rgba(0,0,0,0.85) 55%, transparent 82%)',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, rgba(0,0,0,0.85) 55%, transparent 82%)',
      }
    : {
        width: size, height: size, cursor: 'pointer',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 78%)',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 78%)',
      };

  return (
    <div style={containerStyle}>
      <Canvas
        camera={{ position: [0, 0, fill ? 8.5 : 6.5], fov: fill ? 58 : 42 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Scene mouseX={mouseX} mouseY={mouseY} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            intensity={2.2}
            radius={0.85}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
