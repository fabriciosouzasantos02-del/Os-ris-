import React, { useState } from 'react';
import { AstrologyMap, AstroAstroPosition, UserProfile } from '../types';
import CircularChart from './CircularChart';
import { Orbit, Compass, User, Globe, MessageSquare, Plus, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';

interface AstrologyViewProps {
  mapData: AstrologyMap;
  user: UserProfile;
  onUpdateMainMap: (birthDetails: any) => void;
  readOnly?: boolean;
}

interface ExtraMap {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

export default function AstrologyView({ mapData, user, onUpdateMainMap, readOnly = false }: AstrologyViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'astros' | 'casas' | 'aspectos' | 'extras'>('geral');
  const [selectedAstro, setSelectedAstro] = useState<AstroAstroPosition | null>(mapData.astros[0]);
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  // Extra Maps state 
  const [extraMaps, setExtraMaps] = useState<ExtraMap[]>([]);
  const [showWarning, setShowMainMapWarning] = useState<boolean>(false);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraDate, setNewExtraDate] = useState('');
  const [newExtraTime, setNewExtraTime] = useState('');
  const [newExtraCity, setNewExtraCity] = useState('');

  // Main Map overwrite form state
  const [overwriteDate, setOverwriteDate] = useState(user.birthDate);
  const [overwriteTime, setOverwriteTime] = useState(user.birthTime);
  const [overwriteCity, setOverwriteCity] = useState(user.birthCity);

  const handleCreateExtraMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName || !newExtraDate) return;
    if (extraMaps.length >= 2) {
      alert("Você atingiu o limite de 2 mapas extras permitidos na conta premium.");
      return;
    }
    setExtraMaps([...extraMaps, {
      name: newExtraName,
      birthDate: newExtraDate,
      birthTime: newExtraTime || "12:00",
      birthCity: newExtraCity || "Desconhecida"
    }]);
    setNewExtraName('');
    setNewExtraDate('');
    setNewExtraTime('');
    setNewExtraCity('');
  };

  const handleDeleteExtra = (index: number) => {
    setExtraMaps(extraMaps.filter((_, i) => i !== index));
  };

  const handleOverwriteMainMap = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMainMap({
      birthDate: overwriteDate,
      birthTime: overwriteTime,
      birthCity: overwriteCity
    });
    setShowMainMapWarning(false);
  };

  return (
    <div id="astrology-module" className="space-y-6">
      {/* Astro Tab Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20">
              Módulo Astrologia Premium
            </span>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-slate-100">
              Meu Mapa Astral Completo
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Calculado sob o sistema <span className="text-amber-500/80 font-mono">Placidus</span>. Entenda as configurações celestes precisas que moldam sua consciência.
            </p>
          </div>
          
          {!readOnly && (
            <button 
              onClick={() => setShowMainMapWarning(!showWarning)}
              className="flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-xl text-xs font-medium text-amber-500 hover:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/15 transition-all duration-300 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalcular Meu Mapa</span>
            </button>
          )}
        </div>

        {/* Warning card for overwriting main map */}
        {!readOnly && showWarning && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-red-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400">Você já possui um mapa principal ativo!</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ao recalcular o mapa, o atual será substituído. Se deseja criar mapas de outras pessoas sem afetar o seu, utilize a aba de <span className="font-semibold text-amber-500">MAPAS EXTRAS</span>.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleOverwriteMainMap} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">DATA DE NASCIMENTO</label>
                <input 
                  type="date" 
                  value={overwriteDate} 
                  onChange={(e) => setOverwriteDate(e.target.value)} 
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">HORA (HH:MM)</label>
                <input 
                  type="text" 
                  value={overwriteTime} 
                  onChange={(e) => setOverwriteTime(e.target.value)} 
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  placeholder="e.g. 15:30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">CIDADE</label>
                <input 
                  type="text" 
                  value={overwriteCity} 
                  onChange={(e) => setOverwriteCity(e.target.value)} 
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  placeholder="e.g. São Paulo"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowMainMapWarning(false)} 
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-slate-100 rounded-lg text-xs font-semibold"
                >
                  Substituir Mapa Atual
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {mapData?.is_dst && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 text-slate-200 text-xs leading-relaxed flex items-start gap-3 shadow-xl animate-in fade-in duration-500">
          <span className="text-lg leading-none shrink-0 select-none">🌟</span>
          <p className="text-slate-300">
            <strong>Nota de Precisão:</strong> Identificamos que no dia, hora e local do seu nascimento estava vigorando o Horário de Verão. Plataformas de astrologia mais simples costumam errar o seu Ascendente porque esquecem de descontar essa 1 hora do relógio. Nosso sistema recalculou o céu com base na Hora Solar Real do seu nascimento, garantindo que o seu Ascendente em <strong>{mapData?.astros?.find(a => a.name === "Ascendente")?.sign || "sua data correspondente"}</strong> esteja 100% correto e astronamicamente preciso!
          </p>
        </div>
      )}

      {/* Navigation Subtabs */}
      {/* Scroll indicator for mobile screens */}
      <div className="md:hidden flex items-center justify-between text-[10px] text-amber-500/80 font-mono tracking-wider pb-2 px-1 select-none">
        <span className="text-slate-400">Seções do Mapa</span>
        <span className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full text-[9px] animate-pulse">
          Deslize para o lado ⇄
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('geral')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeSubTab === 'geral' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Distribuição Energética</span>
        </button>
        <button
          onClick={() => setActiveSubTab('astros')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeSubTab === 'astros' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>Posição dos Astros</span>
        </button>
        <button
          onClick={() => setActiveSubTab('casas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeSubTab === 'casas' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Casas Astrológicas</span>
        </button>
        <button
          onClick={() => setActiveSubTab('aspectos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeSubTab === 'aspectos' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Aspectos Planetários</span>
        </button>
        <button
          onClick={() => setActiveSubTab('extras')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeSubTab === 'extras' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Mapas Extras ({extraMaps.length}/2)</span>
        </button>
      </div>

      {/* Main Subtab Contents */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Wheel Chart section */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <CircularChart astros={mapData.astros} />
            <span className="text-[10px] font-mono text-slate-500 mt-3 text-center uppercase tracking-wide">
              Diagrama do firmamento no nascimento ({user.birthCity})
            </span>
          </div>

          {/* Elements, Qualities and polarization sliders */}
          <div className="lg:col-span-3 space-y-6 bg-slate-900/30 p-6 rounded-3xl border border-slate-800/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-xs" />
                1. Distribuição dos Elementos
              </h3>
              
              <div className="space-y-3">
                {/* Fire */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-medium">Fogo (Entusiasmo & Energia)</span>
                    <span className="font-mono text-slate-300">{mapData.distribution.elements.fire}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-850 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${mapData.distribution.elements.fire}%` }} />
                  </div>
                </div>

                {/* Earth */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-medium">Terra (Praticidade & Conquistas)</span>
                    <span className="font-mono text-slate-300">{mapData.distribution.elements.earth}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-850 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${mapData.distribution.elements.earth}%` }} />
                  </div>
                </div>

                {/* Air */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sky-400 font-medium">Ar (Mente, Lógica & Comunicação)</span>
                    <span className="font-mono text-slate-300">{mapData.distribution.elements.air}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-850 overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${mapData.distribution.elements.air}%` }} />
                  </div>
                </div>

                {/* Water */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-indigo-400 font-medium">Água (Sensibilidade & Intuição)</span>
                    <span className="font-mono text-slate-300">{mapData.distribution.elements.water}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-850 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${mapData.distribution.elements.water}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-xs" />
                2. Qualidades Astrológicas
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Cardinal</span>
                  <p className="text-lg font-bold text-slate-100 mt-1">{mapData.distribution.qualities.cardinal}%</p>
                  <p className="text-[9px] text-slate-500 mt-1">Iniciativa & Ação</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Fixo</span>
                  <p className="text-lg font-bold text-amber-500 mt-1">{mapData.distribution.qualities.fixed}%</p>
                  <p className="text-[9px] text-slate-500 mt-1">Estabilidade & Foco</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Mutável</span>
                  <p className="text-lg font-bold text-slate-100 mt-1">{mapData.distribution.qualities.mutable}%</p>
                  <p className="text-[9px] text-slate-500 mt-1">Adaptabilidade</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-xs" />
                3. Polaridade Energética
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="w-20 shrink-0 text-right">
                  <span className="text-xs text-amber-500 font-mono font-bold">{mapData.distribution.polarization.yang}%</span>
                  <span className="block text-[9px] text-slate-400">Ativo / Yang</span>
                </div>
                
                <div className="flex-1 h-3 rounded-full bg-slate-850 overflow-hidden flex">
                  <div className="h-full bg-amber-500" style={{ width: `${mapData.distribution.polarization.yang}%` }} />
                  <div className="h-full bg-slate-400" style={{ width: `${mapData.distribution.polarization.yin}%` }} />
                </div>

                <div className="w-20 shrink-0">
                  <span className="text-xs text-slate-300 font-mono font-bold">{mapData.distribution.polarization.yin}%</span>
                  <span className="block text-[9px] text-slate-400">Reativo / Yin</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Potencial de Coexistência:</h4>
              <div className="flex flex-wrap gap-2">
                {mapData.personalityTraits.harmonious.slice(0, 5).map(trait => (
                  <span key={trait} className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-sans">
                    {trait}
                  </span>
                ))}
                {mapData.personalityTraits.disharmonious.slice(0, 4).map(trait => (
                  <span key={trait} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-sans">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'astros' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rank list of planets */}
          <div className="space-y-2 lg:col-span-1 bg-slate-900/40 p-4 rounded-3xl border border-slate-800 max-h-[460px] overflow-y-auto">
            <h3 className="text-xs font-bold font-mono text-slate-400 px-2 uppercase tracking-wide mb-3">Ranking de Astros</h3>
            
            {mapData.astros.map((ast) => (
              <button
                key={ast.name}
                onClick={() => setSelectedAstro(ast)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                  selectedAstro?.name === ast.name
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-md ring-1 ring-amber-500/10'
                    : 'bg-slate-900 border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-amber-500/80">🪐</span>
                  <div>
                    <h4 className="text-xs font-bold">{ast.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ast.sign} {ast.degree}</p>
                  </div>
                </div>

                {ast.extraInfo && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-slate-950 border border-slate-800 text-[8px] font-mono text-slate-500 uppercase">
                    {ast.extraInfo.split(',')[0]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Selected planet complete interpretation */}
          <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            {selectedAstro ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Influência Cósmica
                    </span>
                    <h2 className="text-2xl font-bold text-slate-100 mt-2 flex items-center gap-1.5">
                      {selectedAstro.name} <span className="text-slate-400 font-medium text-lg">em {selectedAstro.sign}</span>
                    </h2>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xl font-bold text-amber-500 font-mono">{selectedAstro.degree}</span>
                    {selectedAstro.extraInfo && (
                      <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">{selectedAstro.extraInfo}</p>
                    )}
                  </div>
                </div>

                <div className="text-slate-300 leading-relaxed text-xs space-y-3 font-sans">
                  <p className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 text-slate-300 selection:bg-amber-500/30">
                    {selectedAstro.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <h4 className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-wider mb-2">Comportamento de Alta Vibração</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Aproveitar a energia de {selectedAstro.name} em {selectedAstro.sign} significa expressar independência genuína sem necessitar de rebeldia vazia. Busque se autoafirmar por suas conquistas reais e inteligência visionária.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Orbit className="w-12 h-12 text-slate-700 animate-spin" />
                <p className="text-xs font-mono mt-4">Selecione um astro ao lado para visualizar a interpretação.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'casas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* House list selectors */}
          <div className="lg:col-span-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2 bg-slate-900/40 p-4 rounded-3xl border border-slate-800">
            {mapData.houses.map((house) => (
              <button
                key={house.number}
                onClick={() => setSelectedHouse(house.number)}
                className={`py-2 px-1 rounded-xl text-center border transition-all ${
                  selectedHouse === house.number
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-md font-bold'
                    : 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono block">CASA</span>
                <span className="text-lg font-bold font-mono">{house.number}</span>
                <span className="text-[8px] font-sans text-slate-500 block truncate leading-none mt-0.5">{house.sign}</span>
              </button>
            ))}
          </div>

          {/* House Details Panel */}
          <div className="lg:col-span-8 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            {(() => {
              const hs = mapData.houses.find(h => h.number === selectedHouse);
              if (!hs) return null;
              return (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                        Divisão do Espaço Terrestre
                      </span>
                      <h2 className="text-xl font-bold text-slate-100 mt-2">
                        Casa Astrológica {hs.number} <span className="text-slate-400 font-medium">em {hs.sign}</span>
                      </h2>
                    </div>

                    {hs.planet && (
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 rounded-xl">
                        Planeta Ocupante: {hs.planet}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed p-4 rounded-xl bg-slate-950/70 border border-slate-850 selection:bg-amber-500/20">
                    {hs.interpretation}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                    <h4 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Temas Principais desta Casa</h4>
                    <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1">
                      <li>Interação direta com as áreas terrenas governadas por {hs.sign}.</li>
                      <li>Desafios de manifestação material ou social direta.</li>
                      {hs.planet && <li>A energia mutadora de {hs.planet} traz inquietações cruciais para esta área de sua rotina.</li>}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeSubTab === 'aspectos' && (
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">Relações Celestes (Orbes & Aspectos)</h3>
            <p className="text-[11px] text-slate-500">Conjunto de ângulos matemáticos formados entre os astros no momento exato do nascimento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapData.aspects.map((asp, i) => {
              let aspectColor = "border-sky-500/20 text-sky-400 bg-sky-500/5";
              if (asp.aspectType === "Oposição") aspectColor = "border-rose-500/20 text-rose-400 bg-rose-500/5";
              else if (asp.aspectType === "Quadratura") aspectColor = "border-orange-500/20 text-orange-400 bg-orange-500/5";
              else if (asp.aspectType === "Trígono") aspectColor = "border-emerald-500/20 text-emerald-400 bg-emerald-500/5";

              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-850/80 space-y-2 hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{asp.planet1}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide uppercase ${aspectColor}`}>
                        {asp.aspectType}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{asp.planet2}</span>
                    </div>

                    <span className="text-[9px] font-mono text-slate-500">Orbe: {asp.orb}°</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed leading-[1.6]">
                    {asp.interpretation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'extras' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-5 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-200">Cadastrar Novo Mapa Extra</h3>
              <p className="text-[11px] text-slate-500">Crie o mapa de amigos, companheiros ou familiares importante para você.</p>
            </div>

            <form onSubmit={handleCreateExtraMap} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">NOME DA PESSOA</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Maria Silva"
                  value={newExtraName}
                  onChange={(e) => setNewExtraName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">DATA DE NASCIMENTO</label>
                <input 
                  type="date" 
                  required
                  value={newExtraDate}
                  onChange={(e) => setNewExtraDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">HORA (HH:MM)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 18:45"
                    value={newExtraTime}
                    onChange={(e) => setNewExtraTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">CIDADE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rio de Janeiro"
                    value={newExtraCity}
                    onChange={(e) => setNewExtraCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={extraMaps.length >= 2}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-sans font-bold text-xs uppercase transition-all duration-300"
              >
                Gerar & Adicionar {extraMaps.length >= 2 ? '(Limite Atingido)' : ''}
              </button>
            </form>
          </div>

          {/* List of extras slots */}
          <div className="lg:col-span-7 bg-slate-900/20 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Mapas extras cadastrados</h3>
            
            {extraMaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-650 bg-slate-950/40 rounded-2xl border border-slate-850 border-dashed">
                <Compass className="w-10 h-10 text-slate-800 animate-pulse" />
                <p className="text-[11px] text-slate-500 mt-3 text-center max-w-xs leading-relaxed">
                  Nenhum mapa extra criado ainda. Você pode gerir até 2 mapas adicionais de forma premium.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {extraMaps.map((map, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900 border border-slate-850">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded uppercase">
                        Slot {idx + 1} / Mapa Secundário
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{map.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {map.birthDate.split('-').reverse().join('/')} às {map.birthTime} · {map.birthCity}
                      </p>
                    </div>

                    <div className="flex gap-2">
                       <button
                         onClick={() => {
                           // Instantly calculate/visualize them!
                           onUpdateMainMap(map);
                         }}
                         className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-500 rounded-lg text-[10px] font-semibold transition"
                       >
                         Visualizar Como Principal
                       </button>
                       <button
                         onClick={() => handleDeleteExtra(idx)}
                         className="p-1 text-slate-600 hover:text-rose-400 text-xs transition"
                       >
                         Excluir
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
