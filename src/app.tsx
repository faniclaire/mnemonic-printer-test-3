import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

// --- TYPES & INTERFACES ---
type Language = 'EN' | 'FR';
interface MemoryPoint {
  x: number; y: number; type: 'light' | 'image' | 'sound';
  intensity: number; id: string; pillarIndex?: number;
}
interface UserContribution {
  spatialNodes: number; permutations: string[];
  affectiveLinks: number; timestamp: number;
  archetypeId?: string; resonanceScore?: number;
}
interface Translation {
  title: string; zone1: string; zone1_theory: string; zone2: string; zone3: string; zone4: string; zone5: string;
  zone2_desc: string; zone2_st1_title: string; zone2_st1_desc: string; zone2_st2_title: string; zone2_st2_desc: string;
  zone2_st3_title: string; zone2_st3_desc: string; zone3_desc: string; zone4_desc: string; zone5_desc: string;
  print_action: string; add_memory: string; select_lang: string; label_session: string; label_nodes: string;
  label_permutations: string; label_score: string; label_reset: string; label_enter_training: string;
  label_modify: string; label_finalize: string; label_enter_archive: string; label_back_seuil: string;
  label_contribution: string; label_recent_sync: string; label_status: string; label_stable: string;
  label_archived: string; label_you: string; label_analysis: string; label_architecture: string;
  label_logic: string; label_affective: string; label_printer_status: string; label_ready: string;
  label_complexity: string; label_archive_desc: string; view_plan: string; view_iso: string;
  view_axo: string; view_front: string; label_you_are_here: string; label_ar_mode: string;
  label_standard_mode: string; label_camillo_pillars: string; label_camillo_spectator: string;
  nav_instructions: string; theory_cite: string; theory_author: string; st1_fixed: string;
  st2_fixed: string; st3_fixed: string;
}

// --- TRANSLATIONS ---
const translations: Record<Language, Translation> = {
  EN: {
    title: "MNEMONIC ML SPACE", zone1: "The Threshold",
    zone1_theory: "The goal of this experience is to align artificial intelligence with human mnemonic traditions. By using the 'Method of Loci' (Simonides), 'Combinatorial Permutation' (Bruno), and 'Affective Mapping' (Warburg), you are training a latent space that remembers architectural meaning. You are the architect of the model's subconscious.",
    zone2: "Training Stations", zone3: "The Synthesis Model", zone4: "The Output Podium", zone5: "The Collective Archive",
    zone2_desc: "Calibrate the model using historical mnemonic architecture.",
    zone2_st1_title: "Loci Architecture (Simonides)",
    zone2_st1_desc: "Establish the structural grid. These nodes define spatial constraints.\nVectors define the path through the mnemonic theatre.",
    zone2_st2_title: "Combinatorial Wheels (Bruno)",
    zone2_st2_desc: "Define the semantic logic. Align the outer wheels to\nsynthesize new generated symbols in the core.",
    zone2_st3_title: "Mnemosyne Atlas (Warburg)",
    zone2_st3_desc: "The emotional reading of an image is defined by its neighbor.\nConstruct a montage to define the model's affective resonance.",
    zone3_desc: "Observe the synthesis. Your training has generated a persistent architectural memory.",
    zone4_desc: "Receive the physical token of your intervention.",
    zone5_desc: "The Collective Grid. You are now part of a multi-user mnemonic constellation.",
    print_action: "Generate Blueprint", add_memory: "Inject Memory Fragment", select_lang: "Language",
    label_session: "Session ID", label_nodes: "Nodes", label_permutations: "Permutations", label_score: "Score",
    label_reset: "Reset Local Session", label_enter_training: "Begin Training", label_modify: "Modify Parameters",
    label_finalize: "Finalize & Output", label_enter_archive: "Enter Collective Archive",
    label_back_seuil: "Back to Seuil", label_contribution: "Contribution", label_recent_sync: "Recent Synchronizations",
    label_status: "Status", label_stable: "STABLE", label_archived: "ARCHIVED", label_you: "YOU",
    label_analysis: "Training Analysis", label_architecture: "Architecture", label_logic: "Logic",
    label_affective: "Affective", label_printer_status: "Printer Interface", label_ready: "Mnemonic Link Ready",
    label_complexity: "Complexity", label_archive_desc: "The grid grows with every participant. Your contribution is now a permanent structural element of this artificial mnemonic architecture.",
    view_plan: "Plan", view_iso: "Isometric", view_axo: "Axonometric", view_front: "Front",
    label_you_are_here: "YOU ARE HERE", label_ar_mode: "AR Scan", label_standard_mode: "Terminal View",
    label_camillo_pillars: "Pillars Active", label_camillo_spectator: "Sole Spectator Mode",
    nav_instructions: "Drag to Rotate • Shift + Drag to Pan • Scroll to Zoom",
    theory_cite: "Mapping is a tool for sovereign orientation in the computational stack.",
    theory_author: "— Kei Kreutler", st1_fixed: "Loci Stack fixed", st2_fixed: "Semantic core fixed", st3_fixed: "Atlas fixed",
  },
  FR: {
    title: "ESPACE MNÉMONIQUE ML", zone1: "Le Seuil",
    zone1_theory: "Le but de cette expérience est d'aligner l'intelligence artificielle sur les traditions mnémoniques humaines. En utilisant la 'Méthode des Lieux' (Simonides), la 'Permutation Combinatoire' (Bruno) et la 'Cartographie Affective' (Warburg), vous entraînez un espace latent qui se souvient du sens architectural. Vous êtes l'architecte du subconscient du modèle.",
    zone2: "Stations d'Entraînement", zone3: "Le Modèle de Synthèse", zone4: "Le Podium de Sortie", zone5: "L'Archive Collective",
    zone2_desc: "Calibrez le modèle en utilisant l'architecture mnémonique historique.",
    zone2_st1_title: "Architecture des Lieux (Simonide)",
    zone2_st1_desc: "Établissez la grille structurelle. Ces nœuds définissent les contraintes.\nLes vecteurs tracent le chemin dans le théâtre mnémonique.",
    zone2_st2_title: "Roues Combinatoires (Bruno)",
    zone2_st2_desc: "Définissez la logique sémantique. Alignez les roues extérieures\npour synthétiser de nouveaux symboles au cœur.",
    zone2_st3_title: "Atlas Mnemosyne (Warburg)",
    zone2_st3_desc: "La lecture d'une image est définie par sa voisine.\nConstruisez un montage pour définir la résonance affective.",
    zone3_desc: "Observez la synthèse. Votre entraînement a généré une mémoire architecturale persistante.",
    zone4_desc: "Recevez le jeton physique de votre intervention.",
    zone5_desc: "La Grille Collective. Vous faites désormais partie d'une constellation mnémonique multi-utilisateurs.",
    print_action: "Générer le Plan", add_memory: "Injecter un Fragment de Mémoire", select_lang: "Langue",
    label_session: "ID de Session", label_nodes: "Nœuds", label_permutations: "Permutations", label_score: "Score",
    label_reset: "Réinitialiser la Session", label_enter_training: "Commencer l'Entraînement",
    label_modify: "Modifier Paramètres", label_finalize: "Finaliser & Sortie",
    label_enter_archive: "Entrer dans l'Archive Collective", label_back_seuil: "Retour au Seuil",
    label_contribution: "Contribution", label_recent_sync: "Synchronisations Récentes",
    label_status: "Statut", label_stable: "STABLE", label_archived: "ARCHIVÉ", label_you: "VOUS",
    label_analysis: "Analyse d'Entraînement", label_architecture: "Architecture", label_logic: "Logique",
    label_affective: "Affectif", label_printer_status: "Interface Imprimante", label_ready: "Lien Mnémonique Prêt",
    label_complexity: "Complexité", label_archive_desc: "La grille s'agrandit avec chaque participant. Votre contribution est désormais un élément structurel permanent de cette architecture mnémonique artificielle.",
    view_plan: "Plan", view_iso: "Isométrique", view_axo: "Axonométrique", view_front: "Face",
    label_you_are_here: "VOUS ÊTES ICI", label_ar_mode: "Scan RA", label_standard_mode: "Vue Terminal",
    label_camillo_pillars: "Piliers Actifs", label_camillo_spectator: "Mode Spectateur Unique",
    nav_instructions: "Glisser pour Pivoter • Shift + Glisser pour Panoramique • Molette pour Zoom",
    theory_cite: "La cartographie est un outil d'orientation souveraine dans la pile computationnelle.",
    theory_author: "— Kei Kreutler", st1_fixed: "Pile Loci fixée", st2_fixed: "Noyau sémantique fixé", st3_fixed: "Atlas fixé",
  }
};

// --- ZONE COMPONENTS ---

const Zone2_Station1: React.FC<{ t: Translation, onComplete: (p: MemoryPoint) => void }> = ({ t, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<{ x: number, y: number, pillar: number, tier: number }[]>([]);
  const [locked, setLocked] = useState(false);
  const pillars = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const tiers = ["Threshold", "Foundation", "Interior", "Subconscious", "Void"];
  const color = "#99c2d2";
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (locked || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const pillarIndex = Math.floor((x / 100) * pillars.length);
    const newNode = { x, y, pillar: pillarIndex, tier: Math.floor((y / 100) * tiers.length) };
    setNodes(prev => [...prev, newNode]);
    onComplete({ x, y, type: 'light', intensity: 0.5 + Math.random() * 0.5, id: Math.random().toString(36).substr(2, 9), pillarIndex });
  };
  return (
    <div className={`border bg-black/20 flex flex-col h-[560px] p-6 ${locked ? 'shadow-[0_0_15px_rgba(153,194,210,0.2)]' : 'border-zinc-800'}`} style={{ borderColor: locked ? color : undefined }}>
      <div className="mb-8"><h3 className="text-xl font-light italic">{t.zone2_st1_title}</h3><p className="text-xs opacity-60 h-10 overflow-hidden whitespace-pre-line">{t.zone2_st1_desc}</p></div>
      <div ref={containerRef} onClick={handleCanvasClick} className={`relative flex-grow bg-zinc-950 border border-zinc-900 overflow-hidden m-4 ${locked ? 'cursor-default' : 'cursor-crosshair'}`}>
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.03]">{tiers.map((tier, i) => (<div key={i} className="flex-grow border-b border-white flex items-center justify-end pr-2"><span className="text-[5px] mono uppercase">{tier}</span></div>))}</div>
        <div className="absolute inset-0 flex justify-between px-0 opacity-[0.05] pointer-events-none">{pillars.map((p, i) => (<div key={i} className="h-full w-[1px] bg-white border-r border-dashed border-white/20 relative"><span className="absolute bottom-2 left-1 text-[5px] mono uppercase rotate-90 origin-left">LOCUS {p}</span></div>))}</div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">{nodes.length > 1 && nodes.map((node, i) => i === 0 ? null : <line key={i} x1={`${nodes[i-1].x}%`} y1={`${nodes[i-1].y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke={locked ? color : "rgba(255,255,255,0.3)"} strokeWidth="1.2" strokeDasharray="4,2" style={{ opacity: locked ? 0.6 : 1 }} />)}</svg>
        {nodes.map((node, i) => (
          <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${locked ? 'animate-none' : 'bg-white animate-pulse'}`} style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', backgroundColor: locked ? color : undefined }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[5px] mono uppercase text-white/30 whitespace-nowrap">{pillars[node.pillar]}</div>
          </div>
        ))}
        {locked && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20"><span className="text-[10px] mono bg-black px-4 py-1 border uppercase tracking-[0.2em]" style={{ color, borderColor: color + '80' }}>{t.label_archived}</span></div>}
      </div>
      <div className="h-12 mt-4 flex items-center justify-between">{!locked ? <button onClick={() => setLocked(true)} disabled={nodes.length === 0} className="w-full py-2 border border-zinc-700 text-[10px] mono uppercase hover:bg-white transition-all disabled:opacity-30">{t.label_finalize}</button> : <div className="w-full flex justify-between items-center text-[10px] mono uppercase tracking-widest" style={{ color }}><span className="font-bold">{t.st1_fixed}</span><span className="opacity-60">{t.label_nodes}: {nodes.length}</span></div>}</div>
    </div>
  );
};

const Zone2_Station2: React.FC<{ t: Translation, onComplete: (perm: string) => void }> = ({ t, onComplete }) => {
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [locked, setLocked] = useState(false);
  const symbols = ['♄', '♃', '♂', '☉', '♀', '☿', '☽', '◈', '◇', '⬡'];
  const alchemicalGenerated = ['🜁', '🜂', '🜃', '🜄', '🜔', '🜕', '🜖', '🜗', '🜘', '🜙'];
  const color = "#d2c699";
  const innerSymbol = useMemo(() => alchemicalGenerated[Math.abs(((rotation[0]/36)%10) + ((rotation[1]/36)%10)) % 10], [rotation]);
  const rotate = (idx: number) => { if (locked) return; const n = [...rotation]; n[idx] += 36; setRotation(n); };
  const handleLock = () => { setLocked(true); onComplete(`${symbols[(rotation[0]/36)%10]}-${symbols[(rotation[1]/36)%10]}-${innerSymbol}`); };
  return (
    <div className={`border bg-black/20 flex flex-col h-[560px] p-6 ${locked ? 'shadow-[0_0_15px_rgba(210,198,153,0.2)]' : 'border-zinc-800'}`} style={{ borderColor: locked ? color : undefined }}>
      <div className="mb-8"><h3 className="text-xl font-light italic">{t.zone2_st2_title}</h3><p className="text-xs opacity-60 h-10 overflow-hidden whitespace-pre-line">{t.zone2_st2_desc}</p></div>
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-zinc-950 border border-zinc-900 m-4">
        {[0, 1].map(i => (
          <div key={i} onClick={() => rotate(i)} className={`absolute border border-zinc-700/30 rounded-full flex items-center justify-center transition-transform duration-700 ${locked ? '' : 'cursor-pointer hover:bg-zinc-800/10'}`} style={{ width: `${200-i*50}px`, height: `${200-i*50}px`, transform: `rotate(${rotation[i]}deg)` }}>
            {symbols.map((s, si) => <span key={si} className="absolute text-[10px] mono" style={{ transform: `rotate(${si*36}deg) translateY(-${90-i*25}px)`, color: locked ? color : 'rgba(255,255,255,0.6)' }}>{s}</span>)}
          </div>
        ))}
        <div className="absolute w-12 h-12 bg-black border border-zinc-500 flex items-center justify-center" style={{ transform: `rotate(${-rotation[0]-rotation[1]}deg)`, color: locked ? color : 'white' }}><span className="text-xl mono">{innerSymbol}</span></div>
        {locked && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20"><span className="text-[10px] mono bg-black px-4 py-1 border uppercase tracking-[0.2em]" style={{ color, borderColor: color + '80' }}>{t.label_archived}</span></div>}
      </div>
      <div className="h-12 mt-4">{!locked ? <button onClick={handleLock} className="w-full py-2 border border-zinc-700 text-[10px] mono uppercase hover:bg-white transition-all">{t.label_finalize}</button> : <div className="w-full flex justify-between items-center text-[10px] mono uppercase tracking-widest" style={{ color }}><span className="font-bold">{t.st2_fixed}</span><span className="opacity-60">{t.label_permutations}: {innerSymbol}</span></div>}</div>
    </div>
  );
};

const Zone2_Station3: React.FC<{ t: Translation, onComplete: (p: MemoryPoint) => void }> = ({ t, onComplete }) => {
  const [montage, setMontage] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const color = "#d2a999";
  const frags = [
    { id: 10, url: 'https://picsum.photos/seed/arch1/300/200?grayscale', val: 0.5 }, { id: 11, url: 'https://picsum.photos/seed/arch2/300/200?grayscale', val: 0.8 },
    { id: 12, url: 'https://picsum.photos/seed/arch3/300/200?grayscale', val: 0.2 }, { id: 13, url: 'https://picsum.photos/seed/arch4/300/200?grayscale', val: 0.9 },
    { id: 14, url: 'https://picsum.photos/seed/arch5/300/200?grayscale', val: 0.4 }, { id: 15, url: 'https://picsum.photos/seed/arch6/300/200?grayscale', val: 0.7 }
  ];
  const toggle = (id: number) => { if (!locked && (montage.includes(id) || montage.length < 5)) setMontage(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
  const calcRes = () => { let s = 0; for(let i=1; i<montage.length; i++) { const a = frags.find(f => f.id === montage[i-1])?.val || 0.5, b = frags.find(f => f.id === montage[i])?.val || 0.5; s += Math.abs(a-b)*20; } return Math.min(s + (montage.length*5), 100); };
  const finish = () => { setLocked(true); const s = calcRes(); onComplete({ x: Math.random()*100, y: Math.random()*100, type: 'sound', intensity: s/100, id: `MONTAGE-${Date.now()}` }); };
  return (
    <div className={`border bg-black/20 flex flex-col h-[560px] p-6 ${locked ? 'shadow-[0_0_15px_rgba(210,169,153,0.2)]' : 'border-zinc-800'}`} style={{ borderColor: locked ? color : undefined }}>
      <div className="mb-4"><h3 className="text-xl font-light italic">{t.zone2_st3_title}</h3><p className="text-xs opacity-60 h-10 overflow-hidden whitespace-pre-line">{t.zone2_st3_desc}</p></div>
      <div className="mb-4 h-16 flex gap-1 bg-zinc-950 p-1 border border-zinc-900 items-center overflow-x-auto mx-4">{montage.map(id => (<div key={id} className="h-full aspect-square border border-zinc-800 overflow-hidden" style={{ borderColor: locked ? color : undefined }}><img src={frags.find(f => f.id === id)?.url} className="w-full h-full object-cover grayscale" /></div>)) || <span className="text-[7px] mono opacity-20 uppercase mx-auto">Empty</span>}</div>
      <div className="relative flex-grow bg-zinc-950 border border-zinc-900 grid grid-cols-3 gap-2 p-2 m-4">
        {frags.map(f => (<div key={f.id} onClick={() => toggle(f.id)} className={`relative overflow-hidden border ${montage.includes(f.id) ? '' : 'border-zinc-800'}`} style={{ borderColor: montage.includes(f.id) ? color : undefined }}><img src={f.url} className={`w-full h-full object-cover grayscale transition-opacity ${montage.includes(f.id) ? 'opacity-20' : 'opacity-100'}`} /></div>))}
        {locked && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20"><span className="text-[10px] mono bg-black border uppercase tracking-widest px-4 py-1" style={{ color }}>{t.label_archived}</span></div>}
      </div>
      <div className="h-12 mt-4">{!locked ? <button onClick={finish} disabled={montage.length < 2} className="w-full py-2 border border-zinc-700 text-[10px] mono uppercase hover:bg-white transition-all disabled:opacity-30">{t.label_finalize}</button> : <div className="w-full flex justify-between items-center text-[10px] mono uppercase tracking-widest" style={{ color }}><span className="font-bold">{t.st3_fixed}</span><span className="opacity-60">{t.label_score}: {calcRes().toFixed(0)}%</span></div>}</div>
    </div>
  );
};

const Zone3_Model: React.FC<{ memories: MemoryPoint[], contribution: UserContribution, t: Translation, lang: Language }> = ({ memories, contribution, t, lang }) => {
  const [rot, setRot] = useState({ x: 30, y: 45 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.35);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const clr = { arch: "#99c2d2", log: "#d2c699", aff: "#d2a999" };
  const move = useCallback((e: React.MouseEvent) => { if (!isDrag) return; const dx = e.clientX-lastPos.x, dy = e.clientY-lastPos.y; if (e.shiftKey) setOffset(p => ({ x: p.x + dx, y: p.y + dy })); else setRot(p => ({ x: p.x - dy*0.5, y: p.y + dx*0.5 })); setLastPos({ x: e.clientX, y: e.clientY }); }, [isDrag, lastPos]);
  const handleWheel = (e: React.WheelEvent) => setZoom(p => Math.min(Math.max(p - e.deltaY*0.001, 0.1), 3));
  const inject = () => { setIsInjecting(true); setRot(r => ({ x: r.x+5, y: r.y+15 })); setTimeout(() => setIsInjecting(false), 800); };
  const archId = useMemo(() => `ARC-${contribution.timestamp.toString(16).substr(-4).toUpperCase()}`, [contribution.timestamp]);
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="text-center no-print"><h2 className="text-3xl font-light uppercase tracking-widest">{t.zone3}</h2><p className="text-xs opacity-40 uppercase">{t.zone3_desc}</p></div>
      <div className={`relative flex-grow flex gap-4 transition-transform ${isInjecting ? 'scale-[1.01]' : ''}`}>
        <div onMouseDown={e => { setIsDrag(true); setLastPos({ x:e.clientX, y:e.clientY }); }} onMouseMove={move} onMouseUp={() => setIsDrag(false)} onMouseLeave={() => setIsDrag(false)} onWheel={handleWheel} className="relative flex-grow border border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing bg-black">
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 no-print">
            {['plan','iso','axo','front'].map(v => <button key={v} onClick={() => { if(v==='plan') setRot({x:90,y:0}); else if(v==='iso') setRot({x:30,y:45}); else if(v==='axo') setRot({x:45,y:45}); else setRot({x:0,y:0}); setOffset({x:0,y:0}); setZoom(0.35); }} className="px-3 py-1 bg-black/80 border border-zinc-700 text-[9px] mono uppercase hover:border-white transition-all">{v}</button>)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
            <div className="relative w-[500px] h-[500px] transition-transform duration-500 ease-out preserve-3d" style={{ transformStyle: 'preserve-3d', transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
              {contribution.resonanceScore! > 0 && <div className="absolute inset-0 border rounded-full animate-pulse" style={{ borderColor: clr.aff+'50', width: `${350 + contribution.resonanceScore!*4}px`, height: `${350 + contribution.resonanceScore!*4}px`, left:'50%', top:'50%', transform: 'translate(-50%, -50%) rotateX(90deg) translateZ(-250px)' }} />}
              <div className="absolute inset-0 border border-zinc-800" style={{ transform: 'rotateX(90deg) translateZ(-250px)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {memories.map(m => (
                <div key={m.id} className="absolute w-4 h-4 bg-white rounded-full flex items-center justify-center" style={{ transform: `translateX(${(m.x-50)*8}px) translateY(${(m.y-50)*8}px) translateZ(${(m.intensity-0.5)*400}px)`, boxShadow: `0 0 ${m.intensity*40}px white` }}>
                  <div className="absolute h-[1000px] w-[0.8px]" style={{ backgroundColor: clr.arch+'40', transform: 'rotateX(90deg) translateZ(500px)' }} />
                </div>
              ))}
              {contribution.permutations.length > 0 && <div className="absolute w-12 h-96 bg-cyan-400/5 border" style={{ borderColor: clr.log+'40', transform: 'translate3d(0, 0, 100px)' }}>{contribution.permutations.map((p, i) => <span key={i} className="text-[10px] mono rotate-90 opacity-60 absolute" style={{ color: clr.log, top: `${i*30}px`, left: '0' }}>{p}</span>)}</div>}
            </div>
          </div>
          <div className="absolute bottom-6 left-6"><button onClick={inject} className="bg-black/90 border border-white/20 px-6 py-2 text-[10px] mono hover:bg-white transition-all flex items-center gap-2"><span className={`w-2 h-2 ${isInjecting ? 'bg-white scale-150' : 'bg-white/30'} rounded-full`} />{t.add_memory}</button></div>
        </div>
        <div className="w-80 border border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6 no-print">
          <h4 className="text-xs mono uppercase opacity-40 border-b border-zinc-800 pb-2">{t.label_analysis}</h4>
          <section><div className="text-[10px] mono uppercase" style={{ color: clr.arch }}>{t.label_architecture}</div><div className="text-sm mono font-bold" style={{ color: clr.arch }}>{archId}</div><p className="text-[11px] opacity-60 italic mt-1">{contribution.spatialNodes} indices. Foundation sovereign.</p></section>
          <section><div className="text-[10px] mono uppercase" style={{ color: clr.log }}>{t.label_logic}</div><div className="text-sm mono font-bold" style={{ color: clr.log }}>{contribution.archetypeId || 'N/A'}</div><p className="text-[11px] opacity-60 italic mt-1">Weight adjusted via Bruno’s wheel.</p></section>
          <section><div className="text-[10px] mono uppercase" style={{ color: clr.aff }}>{t.label_affective}</div><div className="text-sm mono font-bold" style={{ color: clr.aff }}>{contribution.resonanceScore?.toFixed(0)} SC</div><p className="text-[11px] opacity-60 italic mt-1">Affinity via {contribution.affectiveLinks} points.</p></section>
        </div>
      </div>
    </div>
  );
};

const Zone4_Printer: React.FC<{ t: Translation, contribution: UserContribution, memories: MemoryPoint[], lang: Language }> = ({ t, contribution, memories }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [printing, setPrinting] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const w = 400, h = 450;
    const grid = svg.append('g');
    
    // Sharp black grid
    d3.range(0, w + 40, 40).forEach(d => {
      grid.append('line')
        .attr('x1', d).attr('y1', 0).attr('x2', d).attr('y2', h - 50)
        .attr('stroke', '#000').attr('stroke-width', 0.5).attr('stroke-dasharray', '1,3');
    });
    d3.range(0, h - 10, 40).forEach(d => {
      grid.append('line')
        .attr('x1', 0).attr('y1', d).attr('x2', w).attr('y2', d)
        .attr('stroke', '#000').attr('stroke-width', 0.5).attr('stroke-dasharray', '1,3');
    });

    const g = svg.append('g'), mrg = 50, ps = w - (mrg * 2);
    
    // Draw edges
    memories.forEach((m, i) => {
      const cx = mrg + (m.x / 100) * ps;
      const cy = mrg + (m.y / 100) * ps;
      
      // Node marker
      g.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', 3 + m.intensity * 8)
        .attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', 1.5);
        
      if (i > 0) {
        const prev = memories[i - 1];
        g.append('line')
          .attr('x1', mrg + (prev.x / 100) * ps).attr('y1', mrg + (prev.y / 100) * ps)
          .attr('x2', cx).attr('y2', cy)
          .attr('stroke', '#000').attr('stroke-width', 1);
      }
    });

    // Thermal optimized header
    svg.append('text')
      .attr('x', w / 2).attr('y', -10).attr('text-anchor', 'middle')
      .attr('fill', '#000').style('font-weight', '900').style('font-size', '16px')
      .style('font-family', 'serif').text('MNEMONIC ML OUTPUT');
      
    // Footer metadata
    svg.append('text')
      .attr('x', 0).attr('y', h - 25).attr('fill', '#000')
      .style('font-size', '11px').style('font-family', 'monospace')
      .style('font-weight', 'bold')
      .text(`SESSION ID: ${contribution.timestamp.toString(16).toUpperCase()}`);
      
    svg.append('text')
      .attr('x', 0).attr('y', h - 10).attr('fill', '#000')
      .style('font-size', '11px').style('font-family', 'monospace')
      .style('font-weight', 'bold')
      .text(`NODES: ${contribution.spatialNodes} // ARC: ${contribution.archetypeId || 'N/A'}`);

    // Interactive marker
    for (let x = 0; x < w; x += 10) {
      svg.append('rect').attr('x', x).attr('y', h - 5).attr('width', 2).attr('height', 5).attr('fill', '#000');
    }
  }, [memories, contribution]);

  const handlePrint = async () => {
    const bt = (navigator as any).bluetooth; 
    if (!bt) { alert('Bluetooth not supported. Use Bluefy browser on iPad.'); return; }
    try {
      setPrinting(true); setStatus('SEARCHING...');
      const dev = await bt.requestDevice({ 
        filters: [{ namePrefix: 'ITPP' }, { namePrefix: 'P130' }], 
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb'] 
      });
      setStatus('CONNECTING...');
      const srv = await dev.gatt.connect();
      const psrv = await srv.getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb');
      const char = await psrv.getCharacteristic('0000ff02-0000-1000-8000-00805f9b34fb');
      
      const enc = new TextEncoder();
      const cmds: number[] = [
        0x1B, 0x40, // Init
        0x1B, 0x61, 0x01, // Center
        0x1B, 0x45, 0x01, // Bold
        ...Array.from(enc.encode('MNEMONIC ML OUTPUT\n')),
        0x1B, 0x45, 0x00, // Regular
        ...Array.from(enc.encode(`SESSION ID: ${contribution.timestamp.toString(16).toUpperCase()}\n`)),
        ...Array.from(enc.encode(`ARCHETYPE: ${contribution.archetypeId || 'N/A'}\n`)),
        ...Array.from(enc.encode(`RESONANCE: ${contribution.resonanceScore || 0}%\n`)),
        ...Array.from(enc.encode('--------------------------------\n\n\n\n')),
        0x1D, 0x56, 0x42, 0x00 // Cut
      ];
      
      const buf = new Uint8Array(cmds);
      setStatus('SENDING...');
      const CHUNK = 20;
      for (let i = 0; i < buf.length; i += CHUNK) { 
        await char.writeValue(buf.slice(i, i + CHUNK)); 
        await new Promise(r => setTimeout(r, 25)); 
      }
      
      setStatus('SUCCESS'); 
      setTimeout(() => { setPrinting(false); setStatus(''); }, 2000);
      await srv.disconnect();
    } catch (e) { 
      console.error(e);
      alert('Error printing: ' + (e as Error).message); 
      setPrinting(false); setStatus(''); 
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="print-preview-card">
        <svg 
          ref={svgRef}
          id="blueprint-svg" 
          viewBox="-20 -40 440 500" 
          width="400" 
          height="450" 
          className="bg-white" 
        />
      </div>
      
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 no-print shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <div className="text-[10px] mono opacity-40 uppercase tracking-widest mb-1">Hardware Link</div>
            <div className="text-xs mono text-cyan-400 font-bold uppercase">{printing ? status : 'P130B_READY'}</div>
          </div>
          <button 
            onClick={handlePrint} 
            disabled={printing} 
            className="group relative overflow-hidden px-10 py-4 border border-white/20 hover:border-white text-white transition-all uppercase text-[10px] bg-black tracking-[0.2em]"
          >
            <span className="relative z-10">{printing ? status : "Direct Print (BLE)"}</span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
               SEND DATA
            </span>
          </button>
        </div>
        <p className="text-[9px] mono opacity-20 uppercase tracking-[0.3em] border-t border-zinc-900 pt-4">
          Munbyn P130B // BLE GATT // Chunked-20B
        </p>
      </div>
    </div>
  );
};


const Zone5_Archive: React.FC<{ contribution: UserContribution; t: Translation }> = ({ contribution, t }) => {
  const [rot, setRot] = useState({ x: 20, y: 0 });
  const [zoom, setZoom] = useState(0.2);
  const [drag, setDrag] = useState(false);
  const [lpos, setLpos] = useState({ x: 0, y: 0 });
  const nodes = useMemo(() => {
    const pts = [];
    for(let i=0; i<20; i++) pts.push({ id:`C-${i}`, pos: { x: (Math.random()-0.5)*400, y: (Math.random()-0.5)*400, z: (Math.random()-0.5)*400 }, cur: true });
    for(let j=0; j<200; j++) { const a = Math.random()*Math.PI*2, r = 600+Math.random()*2000; pts.push({ id:`P-${j}`, pos: { x: Math.cos(a)*r, y: (Math.random()-0.5)*1200, z: Math.sin(a)*r } }); }
    return pts;
  }, [contribution.timestamp]);
  const move = useCallback((e: React.MouseEvent) => { if (!drag) return; const dx = e.clientX-lpos.x, dy = e.clientY-lpos.y; setRot(p => ({ x: Math.max(-90, Math.min(90, p.x-dy*0.2)), y: p.y+dx*0.2 })); setLpos({ x:e.clientX, y:e.clientY }); }, [drag, lpos]);
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center h-[70vh]">
      <div className="text-center mb-6"><h2 className="text-4xl font-light uppercase">{t.zone5}</h2><p className="text-xs opacity-40 uppercase">{t.zone5_desc}</p></div>
      <div onMouseDown={e => { setDrag(true); setLpos({ x:e.clientX, y:e.clientY }); }} onMouseMove={move} onMouseUp={() => setDrag(false)} onWheel={e => setZoom(p => Math.min(Math.max(p-e.deltaY*0.0008, 0.05), 3))} className="relative w-full h-full border border-zinc-900 bg-black overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1500px' }}>
          <div className="relative w-1 h-1 transition-transform preserve-3d" style={{ transformStyle: 'preserve-3d', transform: `scale(${zoom}) rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
            {nodes.map(p => (
              <div key={p.id} className="absolute preserve-3d" style={{ transform: `translate3d(${p.pos.x}px, ${p.pos.y}px, ${p.pos.z}px)` }}>
                <div className={`w-1 h-1 rounded-full ${p.cur ? 'bg-[#99c2d2] shadow-[0_0_20px_#99c2d2]' : 'bg-white opacity-80 shadow-[0_0_10px_white]'}`} />
                {p.cur && <div className="absolute h-[1000px] w-[1px] bg-[#99c2d2]/40" style={{ transform: 'rotateX(90deg) translateZ(500px)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('EN');
  const [zone, setZone] = useState(1);
  const [mems, setMems] = useState<MemoryPoint[]>([]);
  const [cont, setCont] = useState<UserContribution>({ spatialNodes: 0, permutations: [], affectiveLinks: 0, timestamp: Date.now() });
  const t = translations[lang];
  const addMem = useCallback((p: MemoryPoint) => { setMems(x => [...x, p]); setCont(x => ({ ...x, spatialNodes: p.type==='light'?x.spatialNodes+1:x.spatialNodes, affectiveLinks: p.type==='sound'?x.affectiveLinks+1:x.affectiveLinks })); }, []);
  return (
    <div className="min-h-screen flex flex-col relative bg-[#050505] text-[#d1d1d1] font-serif overflow-x-hidden">
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none text-white">
        <div className="pointer-events-auto"><h1 className="text-2xl font-light tracking-widest mono">MNEMONIC ML SPACE</h1><p className="text-[10px] mono opacity-50">speculative mnemonic space</p></div>
        <button onClick={() => setLang(l => l==='EN'?'FR':'EN')} className="pointer-events-auto text-xs mono border border-zinc-800 px-3 py-1 bg-black/50">{lang === 'EN' ? 'FRANÇAIS' : 'ENGLISH'}</button>
      </nav>
      <main className="flex-grow flex flex-col justify-center items-center px-4 pt-24 pb-20">
        {zone === 1 && (<div className="max-w-3xl text-center space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000"><h2 className="text-5xl font-light">{t.zone1}</h2><div className="relative p-10 border border-zinc-800 bg-black/40 backdrop-blur-xl"><p className="text-xl italic text-left leading-relaxed">{t.zone1_theory}</p></div><button onClick={() => setZone(2)} className="px-12 py-4 border border-white hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm">{t.label_enter_training}</button></div>)}
        {zone === 2 && (<div className="w-full max-w-6xl"><div className="text-center mb-12"><h2 className="text-3xl font-light">{t.zone2}</h2><p className="opacity-50 text-sm mt-2">{t.zone2_desc}</p></div><div className="grid md:grid-cols-3 gap-8"><Zone2_Station1 t={t} onComplete={addMem} /><Zone2_Station2 t={t} onComplete={p=>setCont(x=>({...x, permutations: [...x.permutations, p], archetypeId:`ARC-${Math.random().toString(36).substr(2,4).toUpperCase()}`}))}/><Zone2_Station3 t={t} onComplete={p=>{addMem(p); setCont(x=>({...x, resonanceScore: (x.resonanceScore||0)+10}));}}/></div><button onClick={() => setZone(3)} className="mx-auto block mt-12 px-10 py-4 border border-zinc-700 hover:border-white transition-colors uppercase text-sm bg-black/50">{t.zone3}</button></div>)}
        {zone === 3 && (<div className="w-full h-[75vh] flex flex-col items-center"><Zone3_Model memories={mems} contribution={cont} t={t} lang={lang} /><div className="mt-8 flex gap-4"><button onClick={() => setZone(2)} className="px-6 py-2 border border-zinc-800 text-xs uppercase hover:bg-zinc-900 transition-all">{t.label_modify}</button><button onClick={() => setZone(4)} className="px-6 py-2 border border-white text-xs uppercase hover:bg-white hover:text-black transition-all">{t.label_finalize}</button></div></div>)}
        {zone === 4 && (<div className="w-full max-w-2xl text-center space-y-8 animate-in slide-in-from-bottom duration-700"><h2 className="text-3xl font-light no-print">{t.zone4}</h2><Zone4_Printer t={t} contribution={cont} memories={mems} lang={lang} /><button onClick={() => setZone(5)} className="mt-8 px-12 py-3 bg-white text-black text-xs font-bold hover:bg-cyan-500 transition-all no-print">{t.label_enter_archive}</button></div>)}
        {zone === 5 && (<div className="w-full h-full animate-in fade-in duration-1000"><Zone5_Archive contribution={cont} t={t} /><button onClick={() => { setMems([]); setCont({spatialNodes:0, permutations:[], affectiveLinks:0, timestamp:Date.now()}); setZone(1); }} className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-2 border border-white/20 text-[10px] mono uppercase transition-all bg-black/80">{t.label_reset}</button></div>)}
      </main>
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center text-[10px] mono opacity-40 uppercase z-50 pointer-events-none"><div>{t.label_session}: {cont.timestamp.toString(16).toUpperCase()}</div><div className="flex gap-4"><span>{t.label_nodes}: {cont.spatialNodes}</span><span>{t.label_permutations}: {cont.permutations.length}</span><span>{t.label_score}: {cont.resonanceScore || 0}</span></div></footer>
    </div>
  );
};
export default App;
