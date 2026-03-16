import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Node, Edge, NodePhysics, GraphData, NodeType } from '../types';
import { Layers, Clock, MousePointer2, Info, Search, Filter, Target, X, Crosshair, Eye, EyeOff, Zap, BookOpen, Brain, Shield } from 'lucide-react';
import { cn } from '../utils/cn';

interface ConceptMapProps {
  graphData: GraphData;
  viewingTick: number;
  onNodeClick: (node: Node) => void;
}

interface HoverState {
  type: 'node' | 'edge' | null;
  id: string | null; // Node ID or Edge composite ID "source-target"
  x: number;
  y: number;
  data?: any;
}

// Spatial Hashing for O(N) Physics
const GRID_SIZE = 120; // Cell size for spatial hash

// Taxonomy Mapping for Filters
const CATEGORY_MAP: Record<string, string[]> = {
    SOURCE: ['SOURCE_DOCUMENT', 'PASSAGE', 'QUOTE', 'SPEAKER'],
    CONCEPT: ['CONCEPT', 'DISTINCTION', 'CLAIM', 'DEFINITION', 'PARADOX', 'APORIA', 'SILENCE_DISCLOSURE'],
    PHENOM: ['EXPERIENCE_PATTERN', 'AFFECTIVE_STATE', 'COGNITIVE_MODE', 'PRACTICE'],
    SAFETY: ['CLINICAL_MARKER', 'SPIRITUAL_MARKER', 'BOUNDARY_RULE'],
    METHOD: ['METHODOLOGY'],
    SESSION: ['USER_UTTERANCE', 'SESSION', 'INTERPRETIVE_FRAME']
};

const getCategory = (type: NodeType): string => {
    for (const [cat, types] of Object.entries(CATEGORY_MAP)) {
        if (types.includes(type)) return cat;
    }
    return 'OTHER';
};

const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'SOURCE': return <BookOpen size={12} />;
        case 'CONCEPT': return <Zap size={12} />;
        case 'PHENOM': return <Brain size={12} />;
        case 'SAFETY': return <Shield size={12} />;
        case 'METHOD': return <Target size={12} />;
        default: return <Layers size={12} />;
    }
};

/**
 * PROTOCOL: OMEGA-DRIFT-NATIVE v2.1
 * Enhanced with Search, Categorical Filtering, and Persistent Focus Mode.
 */
export const ConceptMap: React.FC<ConceptMapProps> = ({ graphData, viewingTick, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeElementsRef = useRef<Record<string, HTMLDivElement>>({});
  
  // Physics State (Mutable for performance)
  const physicsRef = useRef<Map<string, NodePhysics>>(new Map());
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{x: number, y: number} | null>(null);

  // View State
  const [showHistory, setShowHistory] = useState(false);
  const [hoverState, setHoverState] = useState<HoverState>({ type: null, id: null, x: 0, y: 0 });
  
  // Navigation & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['SOURCE', 'CONCEPT', 'PHENOM', 'SAFETY', 'METHOD', 'SESSION', 'OTHER']));
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // 1. Filter Nodes based on Time, Filters, Search, and Focus
  const displayNodes = useMemo(() => {
    let nodes = graphData.nodes;
    const maxTick = graphData.vector_clock || 0;

    // A. Time Filtering
    nodes = nodes.filter(n => {
        if (showHistory) return true; // Show all history
        const created = n.created_tick || 0;
        const decayed = n.decayed_tick || null;
        if (created <= viewingTick) {
             if (decayed !== null && decayed <= viewingTick) return false;
             return true;
        }
        return false;
    });

    // B. Focus Mode (Restrict to Neighbors)
    if (focusNodeId) {
        const neighbors = new Set<string>();
        neighbors.add(focusNodeId);
        graphData.links.forEach(l => {
             const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
             const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
             if (s === focusNodeId) neighbors.add(t);
             if (t === focusNodeId) neighbors.add(s);
        });
        nodes = nodes.filter(n => neighbors.has(n.id));
    }

    // C. Search Filtering
    if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        nodes = nodes.filter(n => 
            n.label.toLowerCase().includes(lowerQ) || 
            (n.description && n.description.toLowerCase().includes(lowerQ))
        );
    }

    // D. Category Filtering
    nodes = nodes.filter(n => activeCategories.has(getCategory(n.type)));

    return nodes;
  }, [graphData, viewingTick, showHistory, focusNodeId, searchQuery, activeCategories]);

  const displayEdges = useMemo(() => {
      const activeIds = new Set(displayNodes.map(n => n.id));
      return graphData.links.filter(l => {
          const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
          const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
          return activeIds.has(sId) && activeIds.has(tId);
      });
  }, [graphData.links, displayNodes]);

  // 2. Initialize Physics for Active Nodes
  useEffect(() => {
    const currentPhysics = physicsRef.current;
    
    // Add new nodes
    displayNodes.forEach((note) => {
      if (!currentPhysics.has(note.id)) {
        currentPhysics.set(note.id, {
          id: note.id,
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
          vx: (Math.random() - 0.5) * 0.2, // Lower initial velocity
          vy: (Math.random() - 0.5) * 0.2,
          mass: note.confidence === 'EVIDENCED' ? 3 : (note.confidence === 'INFERRED' ? 2 : 1),
          instability: note.confidence === 'SPECULATIVE' ? 2.0 : 0.8, // Ethereal drift factor
        });
      }
    });

    // We do NOT remove physics state for hidden nodes immediately to preserve position memory
    // unless they are gone from data completely.
  }, [displayNodes]);

  // 3. The Physics Loop (Spatial Hashing Implementation)
  useEffect(() => {
    const animate = (time: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // --- PHASE 1: SPATIAL GRID BUILD ---
      const grid = new Map<string, NodePhysics[]>();
      const activePhysicsNodes: NodePhysics[] = [];

      // Only simulate currently visible nodes
      const displayIds = new Set(displayNodes.map(n => n.id));

      displayIds.forEach(id => {
          const pNode = physicsRef.current.get(id);
          if (pNode) {
              activePhysicsNodes.push(pNode);
              
              // Hash
              const gx = Math.floor(pNode.x / GRID_SIZE);
              const gy = Math.floor(pNode.y / GRID_SIZE);
              const key = `${gx},${gy}`;
              
              if (!grid.has(key)) grid.set(key, []);
              grid.get(key)!.push(pNode);
          }
      });

      // --- PHASE 2: FORCES ---
      activePhysicsNodes.forEach(node => {
          // A. Ethereal Drift (Sine/Cosine noise)
          const driftSpeed = 0.02 * node.instability;
          const swayX = Math.sin(time * 0.0005 + node.id.charCodeAt(0)) * driftSpeed;
          const swayY = Math.cos(time * 0.0007 + node.id.charCodeAt(1)) * driftSpeed;
          
          node.vx += swayX;
          node.vy += swayY;

          // B. Center Gravity (Weak)
          const dxCenter = (width / 2) - node.x;
          const dyCenter = (height / 2) - node.y;
          node.vx += dxCenter * 0.00005;
          node.vy += dyCenter * 0.00005;

          // C. Spatial Grid Repulsion (Approximate O(N))
          const gx = Math.floor(node.x / GRID_SIZE);
          const gy = Math.floor(node.y / GRID_SIZE);

          for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                  const key = `${gx + i},${gy + j}`;
                  const cellNodes = grid.get(key);
                  if (cellNodes) {
                      cellNodes.forEach(other => {
                          if (node.id === other.id) return;
                          
                          const dx = node.x - other.x;
                          const dy = node.y - other.y;
                          const distSq = dx * dx + dy * dy;
                          
                          // Soft collision radius
                          const minDist = 60 * (node.mass + other.mass) * 0.2; 
                          
                          if (distSq < minDist * minDist && distSq > 0) {
                              const dist = Math.sqrt(distSq);
                              const force = (minDist - dist) / minDist; // Linear repulsion inside radius
                              const repulseX = (dx / dist) * force * 0.5;
                              const repulseY = (dy / dist) * force * 0.5;
                              
                              node.vx += repulseX;
                              node.vy += repulseY;
                          }
                      });
                  }
              }
          }

          // D. Edge Attraction (Hooke's Law) - iterate edges connected to this node
          // To optimize, we iterate edges separately in Phase 3
      });

      // --- PHASE 3: LINKS & INTEGRATION ---
      
      // Edge Attraction
      displayEdges.forEach(edge => {
          const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
          const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
          
          const source = physicsRef.current.get(sId);
          const target = physicsRef.current.get(tId);

          if (source && target && displayIds.has(sId) && displayIds.has(tId)) {
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              // Target distance based on category
              const targetDist = edge.category === 'PARADOX' ? 180 : (edge.category === 'TOPOLOGY' ? 150 : 100);
              
              if (dist > 0) {
                  const force = (dist - targetDist) * 0.001; // Spring constant
                  const fx = (dx / dist) * force;
                  const fy = (dy / dist) * force;

                  source.vx += fx;
                  source.vy += fy;
                  target.vx -= fx;
                  target.vy -= fy;
              }
          }
      });

      // Integration & Boundary
      activePhysicsNodes.forEach(node => {
          node.vx *= 0.94; // Friction
          node.vy *= 0.94;
          
          node.x += node.vx;
          node.y += node.vy;

          // Wall Bounce
          if (node.x < 20) { node.x = 20; node.vx *= -0.5; }
          if (node.x > width - 20) { node.x = width - 20; node.vx *= -0.5; }
          if (node.y < 20) { node.y = 20; node.vy *= -0.5; }
          if (node.y > height - 20) { node.y = height - 20; node.vy *= -0.5; }

          // DOM Update
          const el = nodeElementsRef.current[node.id];
          if (el) {
              el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
          }
      });

      // --- PHASE 4: RENDERING (EDGES & HOVER) ---
      
      let hoveredEdgeFound = null;

      ctx.lineCap = 'round';
      
      // Render Edges
      displayEdges.forEach(edge => {
          const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
          const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
          const source = physicsRef.current.get(sId);
          const target = physicsRef.current.get(tId);

          if (source && target) {
              const edgeKey = `${sId}-${tId}`;
              
              // Edge Hover Detection
              let isHovered = false;
              if (mouseRef.current) {
                  const d = distToSegment({x: source.x, y: source.y}, {x: target.x, y: target.y}, mouseRef.current);
                  if (d < 5) {
                      isHovered = true;
                      hoveredEdgeFound = { type: 'edge', id: edgeKey, x: mouseRef.current.x, y: mouseRef.current.y, data: edge };
                  }
              }

              // Highlight Logic: Is Connected Node Hovered?
              const isNodeHovered = hoverState.type === 'node' && (hoverState.id === sId || hoverState.id === tId);
              const isActive = isHovered || isNodeHovered;

              ctx.beginPath();
              ctx.moveTo(source.x, source.y);
              ctx.lineTo(target.x, target.y);
              
              // Enhanced Highlighting Visuals
              const baseAlpha = isActive ? 0.9 : 0.15;
              const width = isActive ? Math.max(2, Math.sqrt(edge.value) + 1.5) : Math.sqrt(edge.value) * 0.5;
              
              let strokeStyle = `rgba(100, 100, 100, ${baseAlpha})`;
              if (edge.category === 'PARADOX') strokeStyle = `rgba(239, 68, 68, ${baseAlpha})`;
              else if (edge.category === 'EVIDENCE') strokeStyle = `rgba(168, 85, 247, ${baseAlpha})`;
              else if (edge.category === 'BOUNDARY') strokeStyle = `rgba(234, 179, 8, ${baseAlpha})`;

              // If specific edge is hovered OR connected node hovered, make it bright white/colored and add glow
              if (isActive) {
                   strokeStyle = edge.category === 'PARADOX' ? '#fca5a5' : '#ffffff';
                   ctx.shadowBlur = 10;
                   ctx.shadowColor = strokeStyle;
              } else {
                   ctx.shadowBlur = 0;
              }

              ctx.lineWidth = width;
              ctx.strokeStyle = strokeStyle;
              ctx.setLineDash(edge.category === 'CONCEPTUAL' ? [4, 4] : []);
              ctx.stroke();

              // Reset Shadow
              ctx.shadowBlur = 0;

              // Draw Label if hovered
              if (isHovered) {
                  const midX = (source.x + target.x) / 2;
                  const midY = (source.y + target.y) / 2;
                  ctx.fillStyle = '#000000';
                  ctx.fillRect(midX - 2, midY - 2, 4, 4); // Anchor dot
              }
          }
      });
      
      // Update Hover State for Edge if found (prioritize node hover which is handled by DOM)
      if (hoveredEdgeFound && hoverState.type !== 'node') {
          // We only update if it changed to avoid thrashing
          if (hoverState.id !== hoveredEdgeFound.id) {
               setHoverState(hoveredEdgeFound as HoverState);
               if (containerRef.current) containerRef.current.style.cursor = 'pointer';
          }
      } else if (!hoveredEdgeFound && hoverState.type === 'edge') {
          setHoverState({ type: null, id: null, x: 0, y: 0 });
          if (containerRef.current) containerRef.current.style.cursor = 'default';
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [displayNodes, displayEdges, hoverState.type, hoverState.id]);

  // Math Helper: Distance from point to line segment
  function distToSegment(p1: {x:number, y:number}, p2: {x:number, y:number}, p: {x:number, y:number}) {
      const x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
      if (dx !== 0 || dy !== 0) {
          const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
          if (t > 1) { p1 = p2; }
          else if (t > 0) { p1 = { x: x + dx * t, y: y + dy * t }; }
      }
      const dx2 = p.x - p1.x, dy2 = p.y - p1.y;
      return Math.sqrt(dx2 * dx2 + dy2 * dy2);
  }

  // Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          };
      }
  };

  const handleNodeEnter = (node: Node) => {
      setHoverState({
          type: 'node',
          id: node.id,
          x: physicsRef.current.get(node.id)?.x || 0,
          y: physicsRef.current.get(node.id)?.y || 0,
          data: node
      });
  };

  const handleNodeLeave = () => {
      setHoverState(prev => prev.type === 'node' ? { type: null, id: null, x: 0, y: 0 } : prev);
  };

  const toggleCategory = (cat: string) => {
      setActiveCategories(prev => {
          const next = new Set(prev);
          if (next.has(cat)) next.delete(cat);
          else next.add(cat);
          return next;
      });
  };

  return (
    <div 
      ref={containerRef} 
      className="relative size-full select-none overflow-hidden bg-[#050505]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = null; setHoverState({type:null, id:null, x:0, y:0}); }}
    >
      {/* UI: Controls Panel (Top Right) */}
      <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-col items-end gap-3">
           {/* Primary Controls Row */}
           <div className="pointer-events-auto flex items-center gap-2">
               {/* Search Bar */}
               <div className={cn(
                   "bg-void-900 border-void-700 flex items-center overflow-hidden rounded border transition-all",
                   searchQuery ? "border-neon-purple/50 w-48 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "group w-8 hover:w-48"
               )}>
                   <div className="p-2 text-zinc-500">
                       <Search size={14} />
                   </div>
                   <input 
                       type="text"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Find Node..."
                       className="w-full border-none bg-transparent pr-2 font-mono text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                   />
                   {searchQuery && (
                       <button onClick={() => setSearchQuery("")} className="p-2 text-zinc-500 hover:text-white">
                           <X size={12} />
                       </button>
                   )}
               </div>

               {/* Filter Toggle */}
               <button 
                   onClick={() => setShowFilters(!showFilters)}
                   className={cn(
                       "relative rounded border p-2 transition-colors",
                       showFilters ? "bg-void-800 border-zinc-500 text-white" : "bg-void-900 border-void-700 text-zinc-500 hover:text-zinc-300"
                   )}
                   title="Filters"
               >
                   <Filter size={14} />
                   {activeCategories.size < 5 && (
                       <div className="bg-neon-purple absolute right-0 top-0 size-2 rounded-full shadow-[0_0_5px_rgba(168,85,247,1)]" />
                   )}
               </button>

               {/* Time/History Toggle */}
               <button 
                 onClick={() => setShowHistory(!showHistory)}
                 className={cn(
                     "flex items-center gap-2 rounded border p-2 font-mono text-xs transition-colors",
                     showHistory ? "bg-neon-purple/20 border-neon-purple text-neon-purple" : "bg-void-900 border-void-700 text-zinc-500 hover:text-zinc-300"
                 )}
                 title="Toggle Historical Nodes"
               >
                   <Layers size={14} />
                   {showHistory ? "ALL_TIME" : "PRESENT"}
               </button>
           </div>

           {/* Filter Panel */}
           {showFilters && (
               <div className="bg-void-950/95 border-void-700 animate-in fade-in slide-in-from-top-2 pointer-events-auto w-48 rounded-lg border p-3 shadow-2xl backdrop-blur-md">
                   <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                       <span>Node Categories</span>
                       <span className="text-zinc-600">{displayNodes.length} Vis</span>
                   </div>
                   <div className="flex flex-col gap-1">
                       {Object.keys(CATEGORY_MAP).map(cat => (
                           <button
                               key={cat}
                               onClick={() => toggleCategory(cat)}
                               className={cn(
                                   "flex items-center justify-between rounded border border-transparent p-1.5 font-mono text-[10px] transition-colors",
                                   activeCategories.has(cat) 
                                     ? "bg-void-800 border-void-700 text-zinc-200" 
                                     : "hover:bg-void-900 text-zinc-600 hover:text-zinc-400"
                               )}
                           >
                               <div className="flex items-center gap-2">
                                   {getCategoryIcon(cat)}
                                   {cat}
                               </div>
                               <div className={cn("size-1.5 rounded-full", activeCategories.has(cat) ? "bg-green-500" : "bg-zinc-700")} />
                           </button>
                       ))}
                   </div>
               </div>
           )}
      </div>

      {/* Focus Mode Overlay */}
      {focusNodeId && (
          <div className="animate-in fade-in zoom-in-95 pointer-events-auto absolute left-1/2 top-4 z-30 -translate-x-1/2">
              <div className="bg-void-950/90 border-neon-blue/50 flex items-center gap-3 rounded-full border p-2 pr-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <div className="bg-neon-blue/20 text-neon-blue flex size-8 animate-pulse items-center justify-center rounded-full">
                      <Target size={16} />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-neon-blue font-mono text-[10px] font-bold tracking-wider">FOCUS MODE ACTIVE</span>
                      <span className="text-[9px] text-zinc-400">Isolating neighborhood</span>
                  </div>
                  <button 
                      onClick={() => setFocusNodeId(null)}
                      className="ml-2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                      <X size={14} />
                  </button>
              </div>
          </div>
      )}

      {/* Layer 0: Connectivity Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />

      {/* Layer 1: Interactive Nodes */}
      {displayNodes.map((note) => {
          const isHovered = hoverState.type === 'node' && hoverState.id === note.id;
          const isDimmed = hoverState.type === 'node' && !isHovered && hoverState.id !== note.id;
          const isFocused = focusNodeId === note.id;
          
          return (
            <div
              key={note.id}
              ref={(el) => { if (el) nodeElementsRef.current[note.id] = el; }}
              onClick={(e) => { e.stopPropagation(); onNodeClick(note); }}
              onMouseEnter={() => handleNodeEnter(note)}
              onMouseLeave={handleNodeLeave}
              className={cn(
                "absolute left-0 top-0 flex cursor-pointer flex-col items-center justify-center transition-opacity duration-300",
                isDimmed ? "opacity-20 blur-[1px]" : "opacity-100",
                note.confidence === 'SPECULATIVE' && !isHovered && "opacity-60"
              )}
              style={{
                willChange: 'transform',
                zIndex: isHovered ? 50 : 10,
                transform: 'translate3d(-100px, -100px, 0)' // Initial off-screen
              }}
            >
              {/* Node Visual */}
              <div className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-300",
                isHovered || isFocused ? "scale-125 shadow-[0_0_20px_rgba(255,255,255,0.8)]" : "shadow-[0_0_10px_rgba(255,255,255,0.3)]",
                note.type === 'APORIA' ? "animate-pulse border border-red-500/50 bg-transparent" : "bg-zinc-200",
                note.type === 'PARADOX' && "bg-red-600",
                note.type === 'SOURCE_DOCUMENT' && "bg-purple-500",
                note.type === 'BOUNDARY_RULE' && "bg-yellow-600",
                note.type === 'METHODOLOGY' && "bg-teal-600"
              )}
              style={{
                  width: Math.max(8, note.val * 0.6) + 'px',
                  height: Math.max(8, note.val * 0.6) + 'px',
              }}
              >
                  {note.type === 'APORIA' && <div className="size-1 rounded-full bg-red-500" />}
                  {isFocused && (
                      <div className="border-neon-blue absolute inset-0 -m-1 animate-ping rounded-full border opacity-20" />
                  )}
              </div>
              
              {/* Label */}
              <span className={cn(
                  "mt-2 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-tighter transition-colors",
                  isHovered ? "z-50 bg-white font-bold text-black" : "bg-black/40 text-zinc-400 backdrop-blur-[1px]",
                  !isHovered && "max-w-[100px] truncate"
              )}>
                {note.label}
              </span>
            </div>
          );
      })}

      {/* Layer 2: Tooltip Overlay */}
      {hoverState.type && hoverState.data && (
          <div 
             className="animate-in fade-in zoom-in-95 pointer-events-none absolute z-50 duration-100"
             style={{ 
                 top: hoverState.y + 20, 
                 left: hoverState.x + 20 
             }}
          >
              <div className="bg-void-950/95 border-void-700 pointer-events-auto max-w-xs rounded-lg border p-3 shadow-2xl backdrop-blur-md">
                  {hoverState.type === 'node' ? (
                      <>
                          <div className="border-void-800 mb-2 flex items-center gap-2 border-b pb-2">
                              <span className={cn(
                                  "size-2 rounded-full",
                                  hoverState.data.type === 'PARADOX' ? "bg-red-500" : "bg-zinc-400"
                              )} />
                              <span className="flex-1 text-xs font-bold text-zinc-100">{hoverState.data.label}</span>
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setFocusNodeId(focusNodeId === hoverState.data.id ? null : hoverState.data.id);
                                  }}
                                  className={cn(
                                      "hover:bg-void-800 rounded p-1 transition-colors",
                                      focusNodeId === hoverState.data.id ? "text-neon-blue" : "text-zinc-500"
                                  )}
                                  title={focusNodeId === hoverState.data.id ? "Clear Focus" : "Focus Graph"}
                              >
                                  {focusNodeId === hoverState.data.id ? <EyeOff size={12} /> : <Crosshair size={12} />}
                              </button>
                          </div>
                          
                          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                              {getCategoryIcon(getCategory(hoverState.data.type))}
                              {hoverState.data.type}
                          </div>
                          
                          <p className="mb-3 text-[11px] italic leading-tight text-zinc-400">
                              "{hoverState.data.description}"
                          </p>
                          
                          <div className="bg-void-900/50 grid grid-cols-2 gap-2 rounded p-2 font-mono text-[9px] text-zinc-600">
                              <div className="flex flex-col">
                                  <span className="uppercase text-zinc-700">Confidence</span>
                                  <span className={cn(
                                      hoverState.data.confidence === 'EVIDENCED' ? "text-purple-400" : 
                                      hoverState.data.confidence === 'SPECULATIVE' ? "text-orange-400" : "text-blue-400"
                                  )}>{hoverState.data.confidence}</span>
                              </div>
                              <div className="flex flex-col">
                                  <span className="uppercase text-zinc-700">Provenance</span>
                                  <span className="text-zinc-400">
                                      {hoverState.data.provenance?.length ? hoverState.data.provenance[0] : 'N/A'}
                                      {hoverState.data.provenance?.length > 1 && ` +${hoverState.data.provenance.length - 1}`}
                                  </span>
                              </div>
                              {hoverState.data.lens && (
                                  <div className="border-void-800 col-span-2 mt-1 flex flex-col border-t pt-1">
                                      <span className="uppercase text-zinc-700">Lens</span>
                                      <span className="truncate text-zinc-400">{hoverState.data.lens.join(', ')}</span>
                                  </div>
                              )}
                          </div>
                      </>
                  ) : (
                      <>
                          <div className="mb-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                              <Info size={10} /> RELATIONSHIP
                          </div>
                          <div className="text-xs font-bold text-zinc-200">
                             {hoverState.data.relationship}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] uppercase text-zinc-400">
                              <span className={cn(
                                  "size-1.5 rounded-full",
                                  hoverState.data.category === 'PARADOX' ? "bg-red-500" : 
                                  hoverState.data.category === 'EVIDENCE' ? "bg-purple-500" : "bg-zinc-500"
                              )} />
                              {hoverState.data.category} LINK
                          </div>
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
