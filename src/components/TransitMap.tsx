import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AstrologyMap, AstroAstroPosition } from '../types';
import { Orbit, Play, Pause, RotateCcw, Info, Zap, Calendar, TrendingUp } from 'lucide-react';

interface TransitMapProps {
  mapData: AstrologyMap;
}

// Zodiac signs and their degree offsets in the 360 wheeel
const ZODIAC_SIGNS = [
  { name: "Áries", symbol: "♈", element: "fire", color: "#EF4444" },
  { name: "Touro", symbol: "♉", element: "earth", color: "#10B981" },
  { name: "Gêmeos", symbol: "♊", element: "air", color: "#06B6D4" },
  { name: "Câncer", symbol: "♋", element: "water", color: "#6366F1" },
  { name: "Leão", symbol: "♌", element: "fire", color: "#EF4444" },
  { name: "Virgem", symbol: "♍", element: "earth", color: "#10B981" },
  { name: "Libra", symbol: "♎", element: "air", color: "#06B6D4" },
  { name: "Escorpião", symbol: "♏", element: "water", color: "#6366F1" },
  { name: "Sagitário", symbol: "♐", element: "fire", color: "#EF4444" },
  { name: "Capricórnio", symbol: "♑", element: "earth", color: "#10B981" },
  { name: "Aquário", symbol: "♒", element: "air", color: "#06B6D4" },
  { name: "Peixes", symbol: "♓", element: "water", color: "#6366F1" }
];

// Planet orbital configurations and details
interface PlanetConfig {
  name: string;
  label: string;
  baseAngle: number; // approximate base transit angle at reference date
  speed: number;     // speed in degrees per simulation day
  color: string;
  radiusOffset: number; // orbital radius on the d3 visualization canvas
  description: string;
}

const TRANSIT_METADATA: PlanetConfig[] = [
  { name: "Sol", label: "Sol ☀️", baseAngle: 78, speed: 0.98, color: "#F59E0B", radiusOffset: 34, description: "O foco central da vitalidade física e da consciência vigilante." },
  { name: "Lua", label: "Lua 🌙", baseAngle: 332, speed: 13.17, color: "#E2E8F0", radiusOffset: 12, description: "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública." },
  { name: "Mercúrio", label: "Mercúrio ☿", baseAngle: 98, speed: 1.2, color: "#38BDF8", radiusOffset: 20, description: "Regente do raciocínio prático, conexões comerciais e agilidade verbal." },
  { name: "Vênus", label: "Vênus ♀", baseAngle: 62, speed: 1.2, color: "#F472B6", radiusOffset: 27, description: "Atração magnética, acordos estéticos, afetos e valorização material." },
  { name: "Marte", label: "Marte ♂", baseAngle: 192, speed: 0.52, color: "#EF4444", radiusOffset: 41, description: "Energia propulsora, iniciativa de conquista, coragem e impulsão física." },
  { name: "Júpiter", label: "Júpiter ♃", baseAngle: 84, speed: 0.08, color: "#A78BFA", radiusOffset: 50, description: "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas." },
  { name: "Saturno", label: "Saturno ♄", baseAngle: 355, speed: 0.03, color: "#F59E0B", radiusOffset: 59, description: "O mestre das formas rígidas, disciplina temporal e maturação de compromissos." },
  { name: "Urano", label: "Urano ♅", baseAngle: 58, speed: 0.011, color: "#22D3EE", radiusOffset: 68, description: "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador." },
  { name: "Netuno", label: "Netuno ♆", baseAngle: 358, speed: 0.006, color: "#818CF8", radiusOffset: 77, description: "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema." },
  { name: "Plutão", label: "Plutão ♇", baseAngle: 304, speed: 0.004, color: "#F43F5E", radiusOffset: 86, description: "Renascimento por expurgação, regeneração invisível e forças magnéticas inevitáveis." }
];

export default function TransitMap({ mapData }: TransitMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simDays, setSimDays] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1); // days added per loop interval
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Sol");
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 420, height: 420 });

  // Update dimensions with ResizeObserver to maintain standard responsive rules
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      const targetSize = Math.max(280, Math.min(460, width));
      setDimensions({ width: targetSize, height: targetSize });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Simulation loop interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimDays((prev) => prev + (simSpeed * 0.1));
    }, 50); // smooth tick representing real progression
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Read natal positions of planets from birth chart
  const getNatalAngle = (planetName: string): number | null => {
    const matched = mapData.astros.find(
      (a) => a.name.toLowerCase().includes(planetName.toLowerCase()) || 
             planetName.toLowerCase().includes(a.name.toLowerCase())
    );
    if (!matched) return null;
    const signIndex = ZODIAC_SIGNS.findIndex((s) => s.name === matched.sign);
    if (signIndex === -1) return null;
    const deg = parseInt(matched.degree.replace(/\D/g, '')) || 0;
    return (signIndex * 30 + deg) % 360;
  };

  // Compute actual transit angle based on current epoch offset
  const getTransitAngle = (planet: PlanetConfig): number => {
    return (planet.baseAngle + simDays * planet.speed) % 360;
  };

  // Convert angular placement directly to a label (Zodiac sign + Degrees)
  const getAstroLabel = (angle: number) => {
    const normalized = (angle % 360 + 360) % 360;
    const index = Math.floor(normalized / 30);
    const sign = ZODIAC_SIGNS[index];
    const degrees = Math.floor(normalized % 30);
    return {
      signName: sign.name,
      signSymbol: sign.symbol,
      degrees: degrees,
      color: sign.color
    };
  };

  // Custom Aspect algorithm with specific astrological tolerances
  const checkAspect = (angle1: number, angle2: number) => {
    const diff = Math.abs(angle1 - angle2) % 360;
    const distance = diff > 180 ? 360 - diff : diff;

    if (Math.abs(distance - 0) <= 8) {
      return { type: "Conjunção", color: "#F59E0B", symbol: "☌", desc: "Fusão de propósitos celestes e intensidade focalizada." };
    }
    if (Math.abs(distance - 180) <= 8) {
      return { type: "Oposição", color: "#EF4444", symbol: "☍", desc: "Polarização ou reflexão crítica exigindo diplomacia ativa." };
    }
    if (Math.abs(distance - 120) <= 8) {
      return { type: "Trígono", color: "#10B981", symbol: "△", desc: "Fluxo espontâneo que remove entraves com sorte natural." };
    }
    if (Math.abs(distance - 90) <= 8) {
      return { type: "Quadratura", color: "#EC4899", symbol: "☐", desc: "Força transformadora impulsionada sob pressões e atritos." };
    }
    if (Math.abs(distance - 60) <= 6) {
      return { type: "Sextil", color: "#06B6D4", symbol: "⚹", desc: "Oportunidades de colaboração que premiam ações conscientes." };
    }
    return null;
  };

  // Generate all active relationships between transits and natal chart
  const getAllActiveAspects = () => {
    const list: any[] = [];
    TRANSIT_METADATA.forEach((transitPlanet) => {
      const tAngle = getTransitAngle(transitPlanet);
      TRANSIT_METADATA.forEach((natalPlanet) => {
        const nAngle = getNatalAngle(natalPlanet.name);
        if (nAngle !== null) {
          const aspect = checkAspect(tAngle, nAngle);
          if (aspect) {
            list.push({
              transit: transitPlanet.name,
              natal: natalPlanet.name,
              type: aspect.type,
              color: aspect.color,
              symbol: aspect.symbol,
              desc: aspect.desc,
              angleTransit: tAngle,
              angleNatal: nAngle,
              transitRadius: transitPlanet.radiusOffset,
              natalRadius: 0 // offset towards internal core
            });
          }
        }
      });
    });
    return list;
  };

  const activeAspects = getAllActiveAspects();
  
  // Isolate aspects of the hovered or selected planet to draw connecting rays
  const getHighlightedAspects = () => {
    const focusPlanet = hoveredPlanet || selectedPlanet;
    if (!focusPlanet) return [];
    return activeAspects.filter(
      (asp) => asp.transit.toLowerCase() === focusPlanet.toLowerCase() ||
               asp.natal.toLowerCase() === focusPlanet.toLowerCase()
    );
  };

  const highlightedAspects = getHighlightedAspects();

  // Draw the astronomical map with D3 inside useEffect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clean slate render

    const width = dimensions.width;
    const height = dimensions.height;
    const center = width / 2;
    const maxRadius = width / 2 - 25;

    // Define main SVG containers
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${center}, ${center})`);

    // Add glowing filter definitions for cosmic astrolabe visual aesthetic
    const defs = svg.append("defs");
    
    const glowFilter = defs.append("filter")
      .attr("id", "astro-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "blur");

    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Coordinate translation: transform angles into polar coordinates
    const polarToCartesian = (degrees: number, r: number) => {
      // Rotate by -90 deg so 0 degrees matches the Ascendant (Left horizontal axis)
      const radians = (degrees - 90) * Math.PI / 180;
      return {
        x: r * Math.cos(radians),
        y: r * Math.sin(radians)
      };
    };

    // 1. Draw concentric background rings for orbits
    chartGroup.append("circle")
      .attr("r", maxRadius)
      .attr("class", "fill-slate-950 stroke-slate-800")
      .attr("stroke-width", 2);

    // Dynamic inner limits separating Natal Core, Aspects Web and Transit Ring
    const transitRingBoundary = maxRadius - 20;
    const aspectInnerBoundary = maxRadius - 100;

    chartGroup.append("circle")
      .attr("r", transitRingBoundary)
      .attr("class", "fill-transparent stroke-slate-850")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");

    chartGroup.append("circle")
      .attr("r", aspectInnerBoundary)
      .attr("class", "fill-slate-900/10 stroke-slate-800")
      .attr("stroke-width", 1.5);

    // 2. Render Zodiac signs on the peripheral track
    ZODIAC_SIGNS.forEach((sign, idx) => {
      const startAngle = idx * 30;
      const midAngle = startAngle + 15;
      
      const p1 = polarToCartesian(startAngle, maxRadius);
      const p2 = polarToCartesian(startAngle, aspectInnerBoundary);
      
      // Boundaries
      chartGroup.append("line")
        .attr("x1", p1.x)
        .attr("y1", p1.y)
        .attr("x2", p2.x)
        .attr("y2", p2.y)
        .attr("stroke", "rgba(51, 65, 85, 0.35)")
        .attr("stroke-width", 1);

      // Glyphs alignment positions
      const textPos = polarToCartesian(midAngle, maxRadius - 10);
      
      chartGroup.append("text")
        .attr("x", textPos.x)
        .attr("y", textPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", sign.color)
        .attr("class", "text-[12px] font-sans font-bold cursor-default select-none")
        .text(sign.symbol)
        .append("title")
        .text(`${sign.name} (${sign.element.toUpperCase()})`);
    });

    // 3. Draw active aspect connection lines (Link system)
    // Draw background aspect lines if nothing is focused, or highlight selected rays
    const drawRays = highlightedAspects.length > 0 ? highlightedAspects : activeAspects;

    drawRays.forEach((asp) => {
      // Calculate start coord (Transit position)
      const tPlanetConf = TRANSIT_METADATA.find(p => p.name === asp.transit);
      const natalRadius = aspectInnerBoundary - 30;
      const transitRadius = maxRadius - 35 - (tPlanetConf ? tPlanetConf.radiusOffset * 0.25 : 20);

      const pTransit = polarToCartesian(asp.angleTransit, transitRadius);
      const pNatal = polarToCartesian(asp.angleNatal, natalRadius);

      // Render aspect line path
      chartGroup.append("line")
        .attr("x1", pTransit.x)
        .attr("y1", pTransit.y)
        .attr("x2", pNatal.x)
        .attr("y2", pNatal.y)
        .attr("stroke", asp.color)
        .attr("stroke-opacity", highlightedAspects.length > 0 ? 0.95 : 0.22)
        .attr("stroke-width", highlightedAspects.length > 0 ? 1.8 : 0.85)
        .attr("stroke-dasharray", highlightedAspects.length > 0 ? "none" : "2 2")
        .attr("class", "transition-all duration-300");

      if (highlightedAspects.length > 0) {
        // Draw aspect glyph in the middle of vector line
        const midX = (pTransit.x + pNatal.x) / 2;
        const midY = (pTransit.y + pNatal.y) / 2;

        chartGroup.append("circle")
          .attr("cx", midX)
          .attr("cy", midY)
          .attr("r", 6.5)
          .attr("fill", "#020617")
          .attr("stroke", asp.color)
          .attr("stroke-width", 1);

        chartGroup.append("text")
          .attr("x", midX)
          .attr("y", midY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", asp.color)
          .attr("class", "text-[8px] font-bold select-none")
          .text(asp.symbol);
      }
    });

    // 4. Draw Natal birth planets in the inner circle ring
    TRANSIT_METADATA.forEach((planet) => {
      const nAngle = getNatalAngle(planet.name);
      if (nAngle === null) return;

      const natalRadius = aspectInnerBoundary - 30;
      const pos = polarToCartesian(nAngle, natalRadius);

      const isFocused = hoveredPlanet === planet.name || selectedPlanet === planet.name;

      // Group for natal planet
      const natalG = chartGroup.append("g")
        .attr("class", "cursor-pointer")
        .on("click", () => setSelectedPlanet(planet.name))
        .on("mouseover", () => setHoveredPlanet(planet.name))
        .on("mouseleave", () => setHoveredPlanet(null));

      // Indicator circle
      natalG.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", isFocused ? 5.5 : 3.5)
        .attr("fill", "#020617")
        .attr("stroke", planet.color)
        .attr("stroke-width", isFocused ? 2 : 1.2)
        .style("filter", isFocused ? "url(#astro-glow)" : "none");

      // Outer orbit marker line towards the aspect border
      const labelPos = polarToCartesian(nAngle, natalRadius - 16);

      natalG.append("text")
        .attr("x", labelPos.x)
        .attr("y", labelPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", isFocused ? "#FFF" : "rgba(148, 163, 184, 0.55)")
        .attr("class", `font-mono text-[7px] tracking-tighter ${isFocused ? 'font-bold' : ''}`)
        .text(`${planet.name.slice(0, 3).toUpperCase()}ⓝ`);
    });

    // 5. Draw dynamic transit planets in the outer orbits
    TRANSIT_METADATA.forEach((planet) => {
      const tAngle = getTransitAngle(planet);
      const transitRadius = maxRadius - 35 - (planet.radiusOffset * 0.25);
      const pos = polarToCartesian(tAngle, transitRadius);

      const isFocused = hoveredPlanet === planet.name || selectedPlanet === planet.name;

      // Orbit track line
      chartGroup.append("circle")
        .attr("r", transitRadius)
        .attr("fill", "none")
        .attr("stroke", "rgba(51, 65, 85, 0.12)")
        .attr("stroke-width", 0.75);

      // Group for transit planet
      const transitG = chartGroup.append("g")
        .attr("class", "cursor-pointer")
        .on("click", () => setSelectedPlanet(planet.name))
        .on("pointerdown", () => setSelectedPlanet(planet.name))
        .on("mouseover", () => setHoveredPlanet(planet.name))
        .on("mouseleave", () => setHoveredPlanet(null));

      // Interactive halo pulse
      if (isFocused) {
        transitG.append("circle")
          .attr("cx", pos.x)
          .attr("cy", pos.y)
          .attr("r", 9)
          .attr("fill", planet.color)
          .attr("fill-opacity", 0.15)
          .attr("class", "animate-ping");
      }

      // Main core sphere
      transitG.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", isFocused ? 6.5 : 4.5)
        .attr("fill", planet.color)
        .attr("stroke", "#020617")
        .attr("stroke-width", 1.5)
        .style("filter", isFocused ? "url(#astro-glow)" : "none");

      // Orbit label
      const labelPos = polarToCartesian(tAngle, transitRadius + 12);
      
      transitG.append("text")
        .attr("x", labelPos.x)
        .attr("y", labelPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", isFocused ? "#FFF" : planet.color)
        .attr("fill-opacity", isFocused ? 1 : 0.75)
        .attr("class", `font-mono text-[8px] font-semibold select-none`)
        .text(planet.name.slice(0, 3).toUpperCase());
    });

    // 6. Draw center focal compass sun
    chartGroup.append("circle")
      .attr("r", 10)
      .attr("class", "fill-slate-950 stroke-amber-500/30")
      .attr("stroke-width", 1.5);

    chartGroup.append("circle")
      .attr("r", 2.5)
      .attr("class", "fill-amber-500");

  }, [dimensions, simDays, hoveredPlanet, selectedPlanet, mapData]);

  // Read current focused planet config
  const activePlanetConf = TRANSIT_METADATA.find(p => p.name === selectedPlanet) || TRANSIT_METADATA[0];
  const activeTransitAngle = getTransitAngle(activePlanetConf);
  const activeNatalAngle = getNatalAngle(selectedPlanet);

  const transitLabelInfo = getAstroLabel(activeTransitAngle);
  const natalLabelInfo = activeNatalAngle !== null ? getAstroLabel(activeNatalAngle) : null;

  // Single dynamic description for the active transit aspect relationship
  const currentTransitAspectRelations = activeAspects.filter(a => a.transit === selectedPlanet);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Orbit className="w-4 h-4 text-rose-450 animate-spin-slow" />
              Alinhamento de Trânsitos em Tempo Real
            </h3>
            <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[8px] font-mono text-rose-400 rounded-sm">
              D3 Interactive Map
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.
          </p>
        </div>

        {/* Live Simulation controls */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-850">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pausar Fluxo" : "Iniciar Fluxo"}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 transition active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          <button
            onClick={() => {
              setSimDays(0);
              setIsPlaying(false);
            }}
            title="Resetar data oficial (Tempo Real)"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Speed slider */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[8px] font-mono text-slate-550 uppercase">Velocidade:</span>
            <input 
              type="range"
              min="0.1"
              max="15.0"
              step="0.1"
              value={simSpeed}
              onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="text-[9px] font-mono text-rose-400 w-9">{simSpeed.toFixed(1)}d/s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive D3 astrolabe canvas container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          
          <div ref={containerRef} className="w-full flex justify-center items-center">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              className="max-w-full select-none"
            />
          </div>

          {/* Compass labels */}
          <div className="flex justify-between w-full max-w-[340px] mt-1 pr-2 text-[8px] font-mono text-slate-600 select-none">
            <span>[E] LESTE / ASCENDENTE</span>
            <span>OESTE / DESCENDENTE [W]</span>
          </div>

          {/* Days simulated metrics */}
          {simDays !== 0 && (
            <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-1 rounded border border-rose-500/20 text-[9px] font-mono text-rose-450 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 animate-pulse" />
              <span>Simulado: +{Math.round(simDays)} dias de trânsito</span>
            </div>
          )}
        </div>

        {/* Right Column: Visual feedback and detailed explanation card */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Legend indicator */}
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-850">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[9px] text-slate-400 font-mono">Conjunção (0°)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] text-slate-400 font-mono">Oposição (180°)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-slate-400 font-mono">Trígono (120°)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span className="text-[9px] text-slate-400 font-mono">Quadratura (90°)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-slate-400 font-mono">Sextil (60°)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-[9px] text-slate-400 font-mono">ⓝ Natal / ⓣ Trânsito</span>
            </div>
          </div>

          {/* Quick Planet Select buttons list */}
          <div className="flex flex-wrap gap-1">
            {TRANSIT_METADATA.map((p) => {
              const active = selectedPlanet === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlanet(p.name)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-350 font-bold' 
                      : 'bg-slate-950 border border-slate-850 text-slate-450 hover:text-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
            
            {/* Title block */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activePlanetConf.color }} />
                  {activePlanetConf.label}
                </h4>
                <p className="text-[10px] text-slate-450 italic mt-0.5">{activePlanetConf.description}</p>
              </div>
            </div>

            {/* Position Match block */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Trânsito Atual ⓣ</span>
                <div className="text-xs font-semibold flex items-center gap-1 text-slate-300">
                  <span style={{ color: transitLabelInfo.color }} className="font-bold">{transitLabelInfo.signSymbol}</span>
                  <span>{transitLabelInfo.degrees}° de {transitLabelInfo.signName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Posição Natal ⓝ</span>
                <div className="text-xs font-semibold flex items-center gap-1 text-slate-300">
                  {natalLabelInfo ? (
                    <>
                      <span style={{ color: natalLabelInfo.color }} className="font-bold">{natalLabelInfo.signSymbol}</span>
                      <span>{natalLabelInfo.degrees}° de {natalLabelInfo.signName}</span>
                    </>
                  ) : (
                    <span className="text-slate-600 font-mono text-[10px]">Não mapeado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Aspects block */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Aspectos Ativos deste planeta</span>
                <span className="text-[9px] font-mono text-rose-450 font-bold">
                  {currentTransitAspectRelations.length} conexões
                </span>
              </div>
              
              {currentTransitAspectRelations.length > 0 ? (
                <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1">
                  {currentTransitAspectRelations.map((asp, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-slate-900/50 border border-slate-850/60 flex items-start gap-2">
                      <span className="text-xs font-bold pt-0.5" style={{ color: asp.color }}>{asp.symbol}</span>
                      <div className="text-[9.5px] leading-relaxed">
                        <strong style={{ color: asp.color }}>{asp.type}</strong> de <strong className="text-slate-300"> {asp.transit} ⓣ </strong> com seu <strong className="text-slate-300"> {asp.natal} ⓝ </strong>
                        <p className="text-[8.5px] text-slate-450 mt-0.5">{asp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[9px] text-slate-500 italic bg-slate-900/10 p-2 rounded border border-slate-900 leading-normal">
                  Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!
                </div>
              )}
            </div>

          </div>

          {/* Astrology advice according to computed transit alignments */}
          <div className="p-3 bg-linear-to-r from-rose-950/10 to-transparent border-l-2 border-rose-500/20 rounded-r-xl flex gap-2">
            <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] font-mono text-rose-450 uppercase font-bold tracking-wider block">Insight do Alinhamento Ativo</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                {selectedPlanet === "Sol" && "O trânsito solar ilumina seu mapa atual estimulando renovações de identidade."}
                {selectedPlanet === "Lua" && "Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling."}
                {selectedPlanet === "Mercúrio" && "Aceleração de contatos, excelente para reavaliar correspondências importantes."}
                {selectedPlanet === "Vênus" && "Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos."}
                {selectedPlanet === "Marte" && "Mantenha o foco ativo para evitar conflitos desnecessários, redirecione o impulso."}
                {!["Sol", "Lua", "Mercúrio", "Vênus", "Marte"].includes(selectedPlanet) && "Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo."}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
