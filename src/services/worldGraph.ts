/**
 * World Graph - Relationship System
 * Shows connections between all game assets, characters, scenes, and quests.
 * Like Obsidian's graph view, but for game development.
 */

export type GraphNodeType =
  | 'character'
  | 'scene'
  | 'quest'
  | 'item'
  | 'dialogue'
  | 'enemy'
  | 'location'
  | 'event'
  | 'sound'
  | 'script';

export type GraphEdgeType =
  | 'lives_in'
  | 'drops'
  | 'starts'
  | 'uses'
  | 'talks_to'
  | 'fights'
  | 'contains'
  | 'triggers'
  | 'plays'
  | 'requires'
  | 'unlocks'
  | 'connected_to';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  name: string;
  emoji: string;
  description: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label?: string;
  properties: Record<string, unknown>;
  createdAt: number;
}

export interface GraphLayout {
  id: string;
  name: string;
  nodePositions: Map<string, { x: number; y: number }>;
  createdAt: number;
}

const NODE_EMOJIS: Record<GraphNodeType, string> = {
  character: '👤',
  scene: '🌍',
  quest: '📜',
  item: '⚔️',
  dialogue: '💬',
  enemy: '👾',
  location: '📍',
  event: '⚡',
  sound: '🎵',
  script: '📜',
};

const EDGE_COLORS: Record<GraphEdgeType, string> = {
  lives_in: '#22c55e',
  drops: '#eab308',
  starts: '#3b82f6',
  uses: '#8b5cf6',
  talks_to: '#ec4899',
  fights: '#ef4444',
  contains: '#06b6d4',
  triggers: '#f97316',
  plays: '#a855f7',
  requires: '#64748b',
  unlocks: '#10b981',
  connected_to: '#6366f1',
};

export class WorldGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private layouts: Map<string, GraphLayout> = new Map();
  private listeners: Set<(event: string, data: GraphNode | GraphEdge | undefined) => void> = new Set();

  // === Node Management ===

  addNode(type: GraphNodeType, name: string, properties: { description?: string; x?: number; y?: number; tags?: string[] } = {}): GraphNode {
    const id = `node_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const node: GraphNode = {
      id, type, name,
      emoji: NODE_EMOJIS[type],
      description: properties.description || '',
      x: properties.x || Math.random() * 800,
      y: properties.y || Math.random() * 600,
      properties: properties as Record<string, unknown>,
      tags: properties.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.nodes.set(id, node);
    this.emit('nodeAdded', node);
    return node;
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    // Remove connected edges
    this.edges.forEach((edge, edgeId) => {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    });
    this.nodes.delete(id);
    this.emit('nodeRemoved', node);
    return true;
  }

  updateNode(id: string, updates: Partial<GraphNode>): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    Object.assign(node, updates, { updatedAt: Date.now() });
    this.emit('nodeUpdated', node);
    return true;
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNodesByType(type: GraphNodeType): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  searchNodes(query: string): GraphNode[] {
    const lower = query.toLowerCase();
    return Array.from(this.nodes.values()).filter(n =>
      n.name.toLowerCase().includes(lower) ||
      n.description.toLowerCase().includes(lower) ||
      n.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  // === Edge Management ===

  addEdge(source: string, target: string, type: GraphEdgeType, label?: string): GraphEdge | null {
    if (!this.nodes.has(source) || !this.nodes.has(target)) return null;
    const id = `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const edge: GraphEdge = {
      id, source, target, type,
      label,
      properties: {},
      createdAt: Date.now(),
    };
    this.edges.set(id, edge);
    this.emit('edgeAdded', edge);
    return edge;
  }

  removeEdge(id: string): boolean {
    const edge = this.edges.get(id);
    if (!edge) return false;
    this.edges.delete(id);
    this.emit('edgeRemoved', edge);
    return true;
  }

  getEdgesFrom(nodeId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.source === nodeId);
  }

  getEdgesTo(nodeId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.target === nodeId);
  }

  getConnectedNodes(nodeId: string): GraphNode[] {
    const connected = new Set<string>();
    this.edges.forEach(edge => {
      if (edge.source === nodeId) connected.add(edge.target);
      if (edge.target === nodeId) connected.add(edge.source);
    });
    return Array.from(connected).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  // === Graph Analysis ===

  getOrphanNodes(): GraphNode[] {
    const connected = new Set<string>();
    this.edges.forEach(edge => {
      connected.add(edge.source);
      connected.add(edge.target);
    });
    return Array.from(this.nodes.values()).filter(n => !connected.has(n.id));
  }

  findPath(source: string, target: string): GraphNode[] | null {
    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[] }> = [{ node: source, path: [source] }];

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      if (node === target) return path.map(id => this.nodes.get(id)!);
      if (visited.has(node)) continue;
      visited.add(node);

      this.edges.forEach(edge => {
        if (edge.source === node && !visited.has(edge.target)) {
          queue.push({ node: edge.target, path: [...path, edge.target] });
        }
        if (edge.target === node && !visited.has(edge.source)) {
          queue.push({ node: edge.source, path: [...path, edge.source] });
        }
      });
    }
    return null;
  }

  getSubgraph(centerNodeId: string, depth: number = 2): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const queue: Array<{ nodeId: string; currentDepth: number }> = [{ nodeId: centerNodeId, currentDepth: 0 }];

    while (queue.length > 0) {
      const { nodeId, currentDepth } = queue.shift()!;
      if (visitedNodes.has(nodeId) || currentDepth > depth) continue;
      visitedNodes.add(nodeId);

      this.edges.forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          visitedEdges.add(edge.id);
          const nextNode = edge.source === nodeId ? edge.target : edge.source;
          if (!visitedNodes.has(nextNode)) {
            queue.push({ nodeId: nextNode, currentDepth: currentDepth + 1 });
          }
        }
      });
    }

    return {
      nodes: Array.from(visitedNodes).map(id => this.nodes.get(id)!).filter(Boolean),
      edges: Array.from(visitedEdges).map(id => this.edges.get(id)!).filter(Boolean),
    };
  }

  // === Auto-layout (Force-directed) ===

  autoLayout(iterations: number = 100) {
    const nodesArray = Array.from(this.nodes.values());
    const edgesArray = Array.from(this.edges.values());

    // Simple force-directed layout
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < nodesArray.length; i++) {
        for (let j = i + 1; j < nodesArray.length; j++) {
          const dx = nodesArray[j].x - nodesArray[i].x;
          const dy = nodesArray[j].y - nodesArray[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 5000 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodesArray[i].x -= fx;
          nodesArray[i].y -= fy;
          nodesArray[j].x += fx;
          nodesArray[j].y += fy;
        }
      }

      // Attraction along edges
      edgesArray.forEach(edge => {
        const source = this.nodes.get(edge.source);
        const target = this.nodes.get(edge.target);
        if (!source || !target) return;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 150) * 0.01;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.x += fx;
        source.y += fy;
        target.x -= fx;
        target.y -= fy;
      });

      // Center gravity
      const centerX = 400;
      const centerY = 300;
      nodesArray.forEach(node => {
        node.x += (centerX - node.x) * 0.001;
        node.y += (centerY - node.y) * 0.001;
      });
    }

    this.emit('layoutChanged');
  }

  // === Export/Import ===

  export(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  import(data: { nodes: GraphNode[]; edges: GraphEdge[] }) {
    this.nodes.clear();
    this.edges.clear();
    data.nodes.forEach(n => this.nodes.set(n.id, n));
    data.edges.forEach(e => this.edges.set(e.id, e));
    this.emit('graphImported');
  }

  // === Statistics ===

  getStats() {
    const nodeTypes: Record<string, number> = {};
    this.nodes.forEach(n => { nodeTypes[n.type] = (nodeTypes[n.type] || 0) + 1; });
    const edgeTypes: Record<string, number> = {};
    this.edges.forEach(e => { edgeTypes[e.type] = (edgeTypes[e.type] || 0) + 1; });
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      edgeTypes,
      orphans: this.getOrphanNodes().length,
    };
  }

  // === Events ===

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: string, data?: GraphNode | GraphEdge) {
    this.listeners.forEach(fn => fn(event, data));
  }
}

let instance: WorldGraph | null = null;

export function getWorldGraph(): WorldGraph {
  if (!instance) instance = new WorldGraph();
  return instance;
}

export { NODE_EMOJIS, EDGE_COLORS };
