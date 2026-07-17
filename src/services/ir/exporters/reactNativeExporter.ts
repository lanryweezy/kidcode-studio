/**
 * React Native Exporter — Generates React Native code from IR nodes.
 * 
 * This exporter proves the IR can target mobile platforms.
 * The same IR nodes that produce TypeScript also produce React Native.
 * 
 * Architecture:
 *   IRNode[] → generateReactNative() → React Native component string
 */

import { IRNode, commandBlockToIR } from '../types';
import { CommandBlock } from '../../../types';

export interface ReactNativeExportResult {
  component: string;
  appFile: string;
  errors: string[];
}

/**
 * Generate a React Native component from command blocks.
 */
export function exportToReactNative(
  commands: CommandBlock[],
  projectName: string = 'KidCodeGame'
): ReactNativeExportResult {
  const errors: string[] = [];

  // Convert blocks to IR
  const irNodes: IRNode[] = [];
  for (const cmd of commands) {
    const node = commandBlockToIR(cmd);
    if (node) irNodes.push(node);
  }

  const component = generateReactNativeComponent(irNodes, projectName);
  const appFile = generateAppFile(projectName);

  return { component, appFile, errors };
}

/**
 * Generate a React Native game component from IR nodes.
 */
export function generateReactNativeComponent(
  nodes: IRNode[],
  projectName: string
): string {
  const lines: string[] = [];

  lines.push(`import React, { useState, useEffect, useRef } from 'react';`);
  lines.push(`import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';`);
  lines.push(``);
  lines.push(`export default function ${projectName.replace(/[^a-zA-Z0-9]/g, '')}() {`);
  lines.push(`  const [position, setPosition] = useState({ x: 100, y: 200 });`);
  lines.push(`  const [score, setScore] = useState(0);`);
  lines.push(`  const [health, setHealth] = useState(100);`);
  lines.push(`  const [gravity, setGravity] = useState(true);`);
  lines.push(`  const panY = useRef(new Animated.Value(0)).current;`);
  lines.push(``);

  // Generate state updates from IR nodes
  for (const node of nodes) {
    const rnCode = generateReactNativeCode(node);
    if (rnCode) {
      lines.push(`  // ${node.kind}`);
      lines.push(`  ${rnCode}`);
    }
  }

  lines.push(``);
  lines.push(`  return (`);
  lines.push(`    <View style={styles.container}>`);
  lines.push(`      <View style={[styles.player, { left: position.x, top: position.y }]} />`);
  lines.push(`      <Text style={styles.score}>Score: {score}</Text>`);
  lines.push(`      <Text style={styles.health}>Health: {health}</Text>`);
  lines.push(`    </View>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`const styles = StyleSheet.create({`);
  lines.push(`  container: { flex: 1, backgroundColor: '#1a1a2e' },`);
  lines.push(`  player: { width: 30, height: 30, backgroundColor: '#e94560', borderRadius: 15, position: 'absolute' },`);
  lines.push(`  score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 18, fontWeight: 'bold' },`);
  lines.push(`  health: { position: 'absolute', top: 70, left: 20, color: 'white', fontSize: 16 },`);
  lines.push(`});`);

  return lines.join('\n');
}

/**
 * Generate React Native code for a single IR node.
 */
function generateReactNativeCode(node: IRNode): string | null {
  switch (node.kind) {
    case 'move_x':
      return `setPosition(p => ({ ...p, x: p.x + ${node.dx} }));`;
    case 'move_y':
      return `setPosition(p => ({ ...p, y: p.y + ${node.dy} }));`;
    case 'set_velocity_x':
      return `// vx = ${node.vx}`;
    case 'set_velocity_y':
      return `// vy = ${node.vy}`;
    case 'set_gravity':
      return `setGravity(${node.enabled});`;
    case 'set_score':
      return `setScore(${node.value});`;
    case 'change_score':
      return `setScore(s => s + ${node.delta});`;
    case 'set_health':
      return `setHealth(${node.value});`;
    case 'change_health':
      return `setHealth(h => h + ${node.delta});`;
    case 'game_over':
      return `// Game Over — reset game`;
    case 'win_game':
      return `// Win Game — show victory screen`;
    case 'play_sound':
      return `// play_sound: ${node.sound}`;
    case 'say':
      return `// say: "${node.text}"`;
    default:
      return null;
  }
}

/**
 * Generate the App.tsx file for the React Native project.
 */
function generateAppFile(projectName: string): string {
  const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '');
  return `import React from 'react';
import ${safeName} from './${safeName}';

export default function App() {
  return <${safeName} />;
}`;
}
