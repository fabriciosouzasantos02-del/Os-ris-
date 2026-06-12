import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  HelpCircle, 
  RefreshCw, 
  BookOpen, 
  Compass, 
  Layers, 
  Star, 
  Zap, 
  Check, 
  AlertCircle, 
  Calendar, 
  ShieldAlert,
  Flame,
  Sun,
  Moon,
  Info
} from 'lucide-react';

interface TarotCard {
  cardName: string;
  arcanaType: 'major' | 'minor';
  number: number;
  uprightMeaning: string;
  advice: string;
  imageUrl: string;
}

interface TarotSystemProps {
  userName?: string;
}

type TarotMode = 'inteligente' | 'amor' | 'tradicional' | 'semanal';

export default function TarotSystem({ userName }: TarotSystemProps) {
  const [activeMode, setActiveMode] = useState<TarotMode>('inteligente');
  
  // Dynamic cards state and selection flow
  const [tempDrawnCards, setTempDrawnCards] = useState<TarotCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [cardMapping, setCardMapping] = useState<Record<number, TarotCard>>({});
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [selectableCount, setSelectableCount] = useState<number>(0);
  
  // Interactive deck representation (increased to 12 cards for beautiful layout)
  const [deckCards, setDeckCards] = useState<number[]>(Array.from({ length: 12 }, (_, i) => i));

  // Limit States (Daily/Weekly)
  const [cooldowns, setCooldowns] = useState<Record<TarotMode, number | null>>({
    inteligente: null,
    amor: null,
    tradicional: null,
    semanal: null
  });

  // Questions and setups
  const [intelligentQuestion, setIntelligentQuestion] = useState<string>('');
  
  const amorQuestions = [
    "Como será meu futuro amoroso nos próximos meses?",
    "O que ele/ela realmente sente por mim neste ciclo?",
    "Qual o melhor conselho de Orbia para curar meu coração agora?",
    "Como posso me proteger de invejas ou fofocas na relação?"
  ];
  const [selectedAmorQuestion, setSelectedAmorQuestion] = useState<string>(amorQuestions[0]);
  const [isCustomAmor, setIsCustomAmor] = useState<boolean>(false);
  const [customAmorQuestion, setCustomAmorQuestion] = useState<string>('');

  const spreads = [
    { id: 'conselho', name: 'Carta Única (Aconselhamento Exato)', count: 1 },
    { id: 'jornada', name: 'Caminho Completo (Passado, Presente e Futuro)', count: 3 }
  ];
  const [selectedSpread, setSelectedSpread] = useState<'conselho' | 'jornada'>('conselho');

  // Load cooldowns and previously saved sessions on mount / mode switch
  useEffect(() => {
    loadSavedSessions();
  }, [activeMode]);

  const loadSavedSessions = () => {
    const now = Date.now();
    const modes: TarotMode[] = ['inteligente', 'amor', 'tradicional', 'semanal'];
    const updatedCooldowns: Record<TarotMode, number | null> = {
      inteligente: null,
      amor: null,
      tradicional: null,
      semanal: null
    };

    modes.forEach((mode) => {
      const lastDraw = localStorage.getItem(`tarot_last_draw_${mode}`);
      if (lastDraw) {
        const lastTime = parseInt(lastDraw, 10);
        const cooldownMs = mode === 'semanal' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        if (now - lastTime < cooldownMs) {
          updatedCooldowns[mode] = lastTime;
        }
      }
    });

    setCooldowns(updatedCooldowns);

    // If active mode is currently locked, recover the saved reading so they can re-read it
    const lastTime = updatedCooldowns[activeMode];
    if (lastTime) {
      const savedReading = localStorage.getItem(`tarot_saved_reading_${activeMode}`);
      const savedGuidance = localStorage.getItem(`tarot_saved_guidance_${activeMode}`);
      const savedCards = localStorage.getItem(`tarot_saved_cards_${activeMode}`);
      const savedMap = localStorage.getItem(`tarot_saved_map_${activeMode}`);
      const savedIndices = localStorage.getItem(`tarot_saved_indices_${activeMode}`);

      if (savedReading && savedGuidance && savedCards) {
        try {
          setInterpretation(savedReading);
          setGuidance(savedGuidance);
          setTempDrawnCards(JSON.parse(savedCards));
          if (savedMap) setCardMapping(JSON.parse(savedMap));
          if (savedIndices) setRevealedIndices(JSON.parse(savedIndices));
          setSelectableCount(modeCount(activeMode));
        } catch (e) {
          console.error("Erro ao recuperar sessão anterior:", e);
        }
      }
    } else {
      // Clear current display if mode is unlocked and not in progress
      if (tempDrawnCards.length > 0 && selectableCount > 0 && revealedIndices.length === 0) {
        handleResetDraw();
      }
    }
  };

  const modeCount = (mode: TarotMode): number => {
    if (mode === 'inteligente') return 3;
    if (mode === 'amor') return 3;
    if (mode === 'semanal') return 10;
    return selectedSpread === 'conselho' ? 1 : 3;
  };

  // Convert locked timestamp into a nice readable format
  const getNextAvailableTimeStr = (lastDraw: number, mode: TarotMode) => {
    const cooldownMs = mode === 'semanal' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const nextTime = lastDraw + cooldownMs;
    const diffMs = nextTime - Date.now();

    if (diffMs <= 0) return "Agora mesmo";

    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    if (mode === 'semanal') {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d, ${remainingHours}h e ${minutes}min`;
    }

    return `${hours}h e ${minutes}min`;
  };

  // Pre-fetch deck cards from the server first
  const handlePreFetchDeck = async () => {
    const count = modeCount(activeMode);
    
    // Check if locked
    if (cooldowns[activeMode]) {
      return; // Safe block
    }

    setTempDrawnCards([]);
    setRevealedIndices([]);
    setCardMapping({});
    setInterpretation(null);
    setGuidance(null);
    setSelectableCount(count);
    
    // Shuffle interactive deck positions
    setDeckCards(Array.from({ length: 12 }, (_, i) => i).sort(() => Math.random() - 0.5));

    try {
      setIsDrawing(true);
      const res = await fetch('/api/tarot/draw-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      if (res.ok) {
        const data = await res.json();
        setTempDrawnCards(data.cards || []);
      } else {
        throw new Error("Conexão cósmica instável.");
      }
    } catch (e) {
      console.warn("Fallback local:", e);
      // Fallback local cards if server offline
      const mockDeck: TarotCard[] = [
        { cardName: "A Estrela (XVII)", arcanaType: "major", number: 17, uprightMeaning: "Esperança cósmica, cura sincera, fluxo límpido e renovação espiritual.", advice: "Abra-se ao desconhecido, sintonize as energias de bondade que circundam você.", imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0" },
        { cardName: "O Sol (XIX)", arcanaType: "major", number: 19, uprightMeaning: "Clareza plena, vitalidade exuberante, verdades que surgem e colheita abundante.", advice: "Brilhe generosamente e seja sincero com suas atitudes e palavras.", imageUrl: "https://images.unsplash.com/photo-1521714161819-15534968fc5f" },
        { cardName: "O Eremita (IX)", arcanaType: "major", number: 9, uprightMeaning: "Sabedoria profunda, solitude que cura, autoexame consciente e farol espiritual.", advice: "Silencie por um instante, afaste-se da pressa alheia para escutar seu íntimo.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf" },
        { cardName: "A Sacerdotisa (II)", arcanaType: "major", number: 2, uprightMeaning: "Segredos intuitivos, conexão oculta, sabedoria latente e paciência divina.", advice: "Nem tudo deve ser exposto. Confie nas suas visões e no silêncio do coração.", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5" },
        { cardName: "Os Enamorados (VI)", arcanaType: "major", number: 6, uprightMeaning: "Escolhas que vêm do íntimo, alinhamento sincero, conexões vitais e caminhos duplos.", advice: "Tome decisões baseadas no amor compassivo e não no medo do julgamento.", imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176" },
        { cardName: "A Imperatriz (III)", arcanaType: "major", number: 3, uprightMeaning: "Fertilidade ativa, generosidade abundante, beleza real e criação fecunda.", advice: "Alimente suas ideias com alegria e permita que a abundância tome forma visível.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23" },
        { cardName: "O Mago (I)", arcanaType: "major", number: 1, uprightMeaning: "Poder de manifestação, foco afiado, força de vontade e iniciativa criativa.", advice: "Você possui as ferramentas necessárias, mobilize sua energia sutil agora.", imageUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a" },
        { cardName: "O Carro (VII)", arcanaType: "major", number: 7, uprightMeaning: "Foco inabalável, vitória virtuosa, movimento focado e rumo traçado de sucesso.", advice: "Assuma as rédeas de suas ações e progrida com coragem indomada.", imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1d62dc0c45" },
        { cardName: "A Roda da Fortuna (X)", arcanaType: "major", number: 10, uprightMeaning: "Ciclos inevitáveis, reviravolta mística, destino fluido e adaptabilidade terrena.", advice: "Aceite as oscilações cotidianas com flexibilidade de espírito.", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" },
        { cardName: "A Força (VIII)", arcanaType: "major", number: 8, uprightMeaning: "Coragem madura, autodomínio com doçura, força moral e compaixão protetora.", advice: "Maneje os conflitos com suavidade astuta, não responda com violência.", imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc" }
      ];

      const shuffledMock = [...mockDeck].sort(() => Math.random() - 0.5);
      setTempDrawnCards(shuffledMock.slice(0, count));
    } finally {
      setIsDrawing(false);
    }
  };

  const handleSelectInteractiveCard = (deckIndex: number) => {
    if (isDrawing || tempDrawnCards.length === 0) return;
    if (revealedIndices.includes(deckIndex)) return;
    if (revealedIndices.length >= selectableCount) return;

    // Map next card from response to this flipped physical slot
    const nextCardNum = revealedIndices.length;
    const tarotCard = tempDrawnCards[nextCardNum];

    if (tarotCard) {
      setCardMapping((prev) => ({
        ...prev,
        [deckIndex]: tarotCard
      }));
      setRevealedIndices((prev) => [...prev, deckIndex]);
    }
  };

  // Interpret currently mapped cards using AI, taking into account user's custom question
  const handleInterpretWithAI = async () => {
    if (tempDrawnCards.length === 0 || revealedIndices.length < selectableCount) return;

    let finalQuestion = '';
    if (activeMode === 'inteligente') {
      finalQuestion = intelligentQuestion;
    } else if (activeMode === 'amor') {
      finalQuestion = isCustomAmor ? customAmorQuestion : selectedAmorQuestion;
    } else if (activeMode === 'tradicional') {
      finalQuestion = selectedSpread === 'conselho' ? 'Tiragem Clássica de Conselho' : 'Tiragem Passado, Presente e Futuro';
    } else {
      finalQuestion = 'Grande Consagração Semanal dos 10 Arcanos Ancestrais';
    }

    try {
      setIsInterpreting(true);
      const res = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeMode,
          cards: tempDrawnCards,
          question: finalQuestion,
          userName: userName
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInterpretation(data.reading);
        setGuidance(data.guidance);

        // PERSIST the reading so user cannot draw again of that mode today
        const nowTimestamp = Date.now();
        localStorage.setItem(`tarot_last_draw_${activeMode}`, nowTimestamp.toString());
        localStorage.setItem(`tarot_saved_reading_${activeMode}`, data.reading);
        localStorage.setItem(`tarot_saved_guidance_${activeMode}`, data.guidance);
        localStorage.setItem(`tarot_saved_cards_${activeMode}`, JSON.stringify(tempDrawnCards));
        localStorage.setItem(`tarot_saved_map_${activeMode}`, JSON.stringify(cardMapping));
        localStorage.setItem(`tarot_saved_indices_${activeMode}`, JSON.stringify(revealedIndices));

        // Update cooldowns UI
        setCooldowns((prev) => ({
          ...prev,
          [activeMode]: nowTimestamp
        }));
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      const fallbackReading = `Querido(a) ${userName}, as cartas indicam que você passa por um momento de grande peso emocional. Atente-se contra fofocas ou sentimentos invejosos no ambiente laboral e convívio cotidiano. Faça uma oração sincera de blindagem e limpe velhos apegos.`;
      const fallbackGuidance = "Sinto que o amor cósmico cura suas dores. Consagre seu dia e confie no mistério.";
      
      setInterpretation(fallbackReading);
      setGuidance(fallbackGuidance);

      const nowTimestamp = Date.now();
      localStorage.setItem(`tarot_last_draw_${activeMode}`, nowTimestamp.toString());
      localStorage.setItem(`tarot_saved_reading_${activeMode}`, fallbackReading);
      localStorage.setItem(`tarot_saved_guidance_${activeMode}`, fallbackGuidance);
      localStorage.setItem(`tarot_saved_cards_${activeMode}`, JSON.stringify(tempDrawnCards));
      localStorage.setItem(`tarot_saved_map_${activeMode}`, JSON.stringify(cardMapping));
      localStorage.setItem(`tarot_saved_indices_${activeMode}`, JSON.stringify(revealedIndices));

      setCooldowns((prev) => ({
        ...prev,
        [activeMode]: nowTimestamp
      }));
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleResetDraw = () => {
    setTempDrawnCards([]);
    setRevealedIndices([]);
    setCardMapping({});
    setInterpretation(null);
    setGuidance(null);
    setSelectableCount(0);
  };

  // Helper arrays for weekly Celtic/Deep layout cards labels
  const getWeeklyPositionLabel = (index: number) => {
    const labels = [
      "1. Seu Momento Atual",
      "2. O Grande Desafio",
      "3. Força Consciente",
      "4. Subconsciente Oculto",
      "5. Passado Recente",
      "6. Futuro Próximo",
      "7. Atitude Interior",
      "8. Fatores Externos/Ambiente",
      "9. Esperanças, Medos e Invejas",
      "10. Resultado Alquímico"
    ];
    return labels[index] || `Influência ${index + 1}`;
  };

  return (
    <div id="sagrado-tarot-system" className="space-y-8 pb-12">
      
      {/* Tarot Main Header with 2026 Cosmic layout vibes */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-amber-500/10 via-slate-950 to-slate-950 p-6 md:p-8 border border-slate-805 space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 text-left">
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold flex items-center gap-1.5 w-fit">
              <Star className="w-3 h-3 text-amber-400 animate-spin-pulse" />
              Templo Oculto de Orbia • Sabedoria Ancestral
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-sans tracking-tight text-white uppercase">
              Tarot Taróloga de Verdade
            </h2>
            <p className="text-slate-400 text-xs font-sans max-w-2xl leading-relaxed">
              Conselhos vivos e canalizações profundas sobre sua vida amorosa, trabalho, relacionamentos e blindagem contra mal olhado e invejas. Uma experiência sensitiva realista inspirada em consultas presenciais.
            </p>
          </div>
          
          <div className="bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-right shrink-0">
            <span className="text-[9px] font-mono text-slate-500 block">SINTONIZADOR CELESTE</span>
            <span className="text-xs font-mono font-bold text-amber-400">Ativo • Orbia Tarot Real</span>
          </div>
        </div>

        {/* Categories Grid (emphasizing the weekly reading heavily) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-900 z-10 relative">
          
          {/* Highlighted Item: Tarot Semanal (Destaque Máximo) */}
          <button
            onClick={() => { setActiveMode('semanal'); handleResetDraw(); }}
            className={`md:col-span-1 p-3.5 rounded-2xl border-2 text-left transition duration-300 flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer select-none ${
              activeMode === 'semanal' 
                ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-400/80 text-amber-200 shadow-xl shadow-amber-500/5' 
                : 'bg-slate-950/90 hover:bg-slate-900 border-amber-500/30 text-amber-400 hover:text-amber-200 hover:border-amber-400/50'
            }`}
          >
            {/* Crown of stars top-right */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-450/25">
              <Flame className="w-2.5 h-2.5 text-amber-400 animate-bounce" />
              <span className="text-[7.5px] font-mono font-bold text-amber-400 uppercase tracking-widest">DESTAQUE PRINCIPAL</span>
            </div>

            <div className="flex items-center justify-between">
              <Calendar className="w-5 h-5 text-amber-400" />
              {activeMode === 'semanal' && <span className="w-2 h-2 rounded-full bg-amber-450 animate-ping" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black tracking-tight font-sans uppercase text-white">✨ Tarot Semanal Profundo</h4>
              <p className="text-[9px] leading-snug text-slate-400">
                Tiragem de 10 Cartas com leitura espiritual completa de trânsitos, invejas e trabalho. Uma consulta por semana.
              </p>
            </div>
          </button>

          {/* 1: Tarot Inteligente */}
          <button
            onClick={() => { setActiveMode('inteligente'); handleResetDraw(); }}
            className={`p-3.5 rounded-2xl border text-left transition duration-300 flex flex-col justify-between h-28 cursor-pointer select-none ${
              activeMode === 'inteligente' 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sparkles className={`w-4 h-4 ${activeMode === 'inteligente' ? 'text-amber-400' : 'text-slate-500'}`} />
              {activeMode === 'inteligente' && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold font-sans">Tarot Inteligente</h4>
              <p className="text-[9px] leading-snug text-slate-400">
                Conselhos e tiragens mágicas unindo tecnologia espiritual planetária.
              </p>
            </div>
          </button>

          {/* 2: Tarot do Amor */}
          <button
            onClick={() => { setActiveMode('amor'); handleResetDraw(); }}
            className={`p-3.5 rounded-2xl border text-left transition duration-300 flex flex-col justify-between h-28 cursor-pointer select-none ${
              activeMode === 'amor' 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Heart className={`w-4 h-4 ${activeMode === 'amor' ? 'text-rose-450' : 'text-slate-500'}`} />
              {activeMode === 'amor' && <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold font-sans">Tarot do Amor</h4>
              <p className="text-[9px] leading-snug text-slate-400">
                Conselhos dos caminhos afetivos para os assuntos e angústias amorosas.
              </p>
            </div>
          </button>

          {/* 3: Tarot Tradicional */}
          <button
            onClick={() => { setActiveMode('tradicional'); handleResetDraw(); }}
            className={`p-3.5 rounded-2xl border text-left transition duration-300 flex flex-col justify-between h-28 cursor-pointer select-none ${
              activeMode === 'tradicional' 
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-200' 
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <BookOpen className={`w-4 h-4 ${activeMode === 'tradicional' ? 'text-purple-400' : 'text-slate-500'}`} />
              {activeMode === 'tradicional' && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold font-sans">Tarot Tradicional</h4>
              <p className="text-[9px] leading-snug text-slate-400">
                Tiragens clássicas para aconselhamentos rápidos dos Arcanos Maiores.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Main Interactive Interactive Board Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
        
        {/* Left Column: Drawing/Interactive zone (7 cols) */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805 space-y-5">
            
            {/* Dynamic Label for current mode */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Compass className={`w-4.5 h-4.5 shrink-0 ${
                  activeMode === 'semanal' ? 'text-amber-400' : activeMode === 'amor' ? 'text-rose-400' : activeMode === 'tradicional' ? 'text-purple-400' : 'text-amber-500'
                }`} />
                {activeMode === 'semanal' ? 'Tiragem Profunda Semanal (10 Cartas)' : `Sua Consulta de Tarot ${activeMode === 'inteligente' ? 'Inteligente' : activeMode === 'amor' ? 'do Amor' : 'Tradicional'}`}
              </h3>

              {/* Status Limit label */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400 uppercase font-semibold">
                  Limite: 1x por {activeMode === 'semanal' ? 'semana' : 'dia'}
                </span>
              </div>
            </div>

            {/* If Cooldown exists, warn gently AND show reading loader */}
            {cooldowns[activeMode] && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="flex gap-2.5 text-left">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-200">Energias Consagradas Conservadas</h5>
                    <p className="text-[11px] leading-relaxed text-amber-400/90 font-sans">
                      {userName ? `Olá, ${userName}. ` : "Olá! "}Você já realizou sua tiragem nesta sessão hoje! O tarot é uma ferramenta de reflexão espiritual profunda. Sorteios frequentes tumultuam o fluxo de sintonização sutil dos arcanos.
                    </p>
                    <p className="text-[10px] text-slate-300 font-mono mt-1">
                      Sua próxima leitura nesta sessão estará liberada em estimadamente: <span className="text-amber-300 font-bold">{getNextAvailableTimeStr(cooldowns[activeMode]!, activeMode)}</span>.
                    </p>
                  </div>
                </div>
                
                {interpretation && (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-405">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      RE-LEITURA DO CONSELHO ATUAL JÁ DISPONÍVEL ABAIXO
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input fields based on selected mode (if not locked!) */}
            {!cooldowns[activeMode] && (
              <>
                {activeMode === 'inteligente' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-slate-450 block">Qual sua questão central de autoconhecimento hoje?</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={intelligentQuestion}
                        onChange={(e) => setIntelligentQuestion(e.target.value)}
                        placeholder="Ex: Qual caminho profissional devo trilhar nesta transição complicada de Saturno?"
                        className="w-full bg-slate-950 text-slate-200 rounded-xl px-4 py-3 text-xs border border-slate-800 focus:outline-none focus:border-amber-500/50 pr-10"
                      />
                      <HelpCircle className="w-4 h-4 text-slate-600 absolute right-3.5 top-3.5" />
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans italic">
                      * Orbia unirá a efeméride às cartas para formular uma resposta de taróloga real sobre tramas cotidianas, energias e focos.
                    </p>
                  </div>
                )}

                {activeMode === 'amor' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-450 block">Escolha uma questão romântica profunda:</label>
                      <div className="grid grid-cols-1 gap-2">
                        {amorQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedAmorQuestion(q); setIsCustomAmor(false); }}
                            className={`text-left p-3 rounded-xl text-xs font-sans transition-colors cursor-pointer border flex items-center gap-2 ${
                              !isCustomAmor && selectedAmorQuestion === q
                                ? 'bg-rose-500/10 text-rose-305 border-rose-500/35 font-semibold'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-850 hover:bg-slate-900/60'
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-550 shrink-0" />
                            {q}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setIsCustomAmor(true)}
                          className={`text-left p-3 rounded-xl text-xs font-sans transition-colors cursor-pointer border flex items-center gap-2 ${
                            isCustomAmor
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-semibold'
                              : 'bg-slate-950 text-slate-440 hover:text-slate-200 border-slate-850 hover:bg-slate-900/60'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          Quero escrever uma pergunta personalizada de amor...
                        </button>
                      </div>
                    </div>

                    {isCustomAmor && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-1">
                        <label className="text-[10px] font-mono uppercase text-slate-450 block">Sua pergunta afetiva:</label>
                        <input
                          type="text"
                          value={customAmorQuestion}
                          onChange={(e) => setCustomAmorQuestion(e.target.value)}
                          placeholder="Ex: Como posso abrir meu coração novamente e me blindar de energias pesadas?"
                          className="w-full bg-slate-950 text-slate-200 rounded-xl px-4 py-3 text-xs border border-slate-800 focus:outline-none focus:border-rose-500/50"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeMode === 'tradicional' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-slate-450 block">Escolha o formato de tiragem clássica:</label>
                    <div className="grid grid-cols-2 gap-3">
                      {spreads.map((spr) => (
                        <button
                          key={spr.id}
                          onClick={() => { setSelectedSpread(spr.id as any); handleResetDraw(); }}
                          className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between h-20 ${
                            selectedSpread === spr.id
                              ? 'bg-purple-500/10 border-purple-500/35 text-purple-300'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Layers className="w-4 h-4 text-purple-400" />
                          <span className="text-[10.5px] font-sans font-bold leading-tight">{spr.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeMode === 'semanal' && (
                  <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15 text-xs text-slate-400 leading-relaxed font-sans space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-500" />
                      A PREVISÃO COMPLETA DE SUA LINHA DO TEMPO
                    </div>
                    <p>
                      Essa leitura profunda sacará <strong>10 cartas</strong> do oráculo. Orbia analisará cada influenciador crucial para seu destino nos próximos 7 dias: sua atitude, finanças, trabalho, o romance sutil, medos, conselho de oração de alma e barreiras de mal olhado ou inveja no ambiente laboral e familiar. Sintonize suas intenções antes de sortear.
                    </p>
                  </div>
                )}

                {/* Steps & Buttons Control to Initiate drawing */}
                {selectableCount === 0 ? (
                  <div className="pt-3">
                    <button
                      onClick={handlePreFetchDeck}
                      disabled={isDrawing}
                      className={`w-full py-4 rounded-2xl text-xs font-bold font-mono uppercase cursor-pointer tracking-wider text-slate-950 transition duration-300 hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 ${
                        isDrawing ? 'opacity-50 cursor-wait' : ''
                      } ${
                        activeMode === 'inteligente' 
                          ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/10' 
                          : activeMode === 'amor' 
                            ? 'bg-rose-400 hover:bg-rose-300 shadow-rose-500/10' 
                            : activeMode === 'semanal'
                              ? 'bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 shadow-amber-500/10'
                              : 'bg-purple-400 hover:bg-purple-300 shadow-purple-500/10'
                      }`}
                    >
                      {isDrawing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Consagrando Deck de Cartas...
                        </>
                      ) : (
                        <>
                          <Layers className="w-4 h-4 shrink-0" />
                          Abra o Deck do Templo Oculto ({modeCount(activeMode)} {modeCount(activeMode) === 1 ? 'Carta' : 'Cartas'})
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 pt-2">
                    
                    {/* Information / Instruction label */}
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Sintonizando: <strong className="text-amber-400 font-bold">{revealedIndices.length}</strong> de <strong className="text-amber-300">{selectableCount}</strong> cartas sorteadas
                        </span>
                      </div>
                      
                      {revealedIndices.length < selectableCount && (
                        <button 
                          onClick={handleResetDraw}
                          className="text-[9px] font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer uppercase font-bold"
                        >
                          Mudar Perguntas
                        </button>
                      )}
                    </div>

                    {/* DYNAMIC CARD DECK WITH 3D FLIP EFFECT ON DECK BACKS */}
                    <span className="text-[10.5px] font-mono text-slate-450 uppercase block tracking-wider text-center">
                      🔮 Toque nas cartas de costas para realizar sua escolha intuitiva:
                    </span>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-slate-950/60 p-5 rounded-2xl border border-slate-850 relative">
                      {deckCards.map((deckVal) => {
                        const isRevealed = revealedIndices.includes(deckVal);
                        const mappedCard = cardMapping[deckVal];
                        const positionInReveal = revealedIndices.indexOf(deckVal);
                        const isFullSelection = revealedIndices.length >= selectableCount;

                        return (
                          <div 
                            key={deckVal}
                            onClick={() => handleSelectInteractiveCard(deckVal)}
                            className="aspect-[2/3] w-full relative cursor-pointer select-none"
                            style={{ perspective: '1000px' }}
                          >
                            <div 
                              className="w-full h-full relative"
                              style={{ 
                                transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              
                              {/* BACK SIDE OF CHE CAARD (Golden mystic lines) */}
                              <div 
                                className={`absolute inset-0 w-full h-full rounded-xl border-2 flex flex-col items-center justify-center p-1 overflow-hidden pointer-events-none ${
                                  isFullSelection && !isRevealed
                                    ? 'border-slate-900 bg-slate-950 opacity-30'
                                    : 'border-amber-400/40 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 shadow-md group-hover:border-amber-400'
                                }`}
                                style={{ 
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  zIndex: isRevealed ? 0 : 2
                                }}
                              >
                                <div className="absolute top-1 left-1 right-1 bottom-1 border border-amber-500/10 rounded-lg pointer-events-none flex flex-col items-center justify-around">
                                  <span className="text-[8px] font-mono text-amber-500/25 leading-none">✦</span>
                                  <div className="w-5 h-5 border border-amber-500/30 rounded-full flex items-center justify-center rotate-45">
                                    <span className="text-[10px] font-mono font-black text-amber-400/40">✦</span>
                                  </div>
                                  <span className="text-[6.5px] font-mono uppercase tracking-widest text-amber-500/20 leading-none">ORB</span>
                                </div>
                              </div>

                              {/* FRONT SIDE (Revealed Tarot Card info!) */}
                              <div 
                                className="absolute inset-0 w-full h-full rounded-xl border-2 border-emerald-500/80 bg-slate-950 flex flex-col overflow-hidden pointer-events-none"
                                style={{ 
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg)',
                                  zIndex: isRevealed ? 2 : 0
                                }}
                              >
                                {mappedCard && (
                                  <div className="w-full h-full relative flex flex-col">
                                    {/* Unsplash beautiful layout */}
                                    <div className="w-full h-[62%] relative overflow-hidden bg-slate-900">
                                      <img 
                                        src={mappedCard.imageUrl} 
                                        alt={mappedCard.cardName}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover object-center scale-110"
                                      />
                                      {/* Gradient blend */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                      
                                      {/* Order chosen badge */}
                                      <div className="absolute top-1 left-1 bg-emerald-500 text-slate-950 font-black font-mono text-[7px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow">
                                        {positionInReveal + 1}
                                      </div>
                                    </div>

                                    {/* Mapped Card details */}
                                    <div className="p-1 flex-1 flex flex-col justify-between bg-slate-950 text-left">
                                      <div className="space-y-0.5 leading-none">
                                        <h5 className="text-[8.5px] font-black text-emerald-300 leading-tight truncate">
                                          {mappedCard.cardName}
                                        </h5>
                                        <p className="text-[6.5px] text-slate-400 line-clamp-2 leading-relaxed italic">
                                          "{mappedCard.uprightMeaning}"
                                        </p>
                                      </div>
                                      
                                      <div className="text-[6px] text-amber-400/80 border-t border-slate-900 pt-0.5 font-mono truncate leading-tight">
                                        Foco: {mappedCard.advice}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mapped view text detail block (only shown after choosing) */}
                    {revealedIndices.length === selectableCount && (
                      <div className="space-y-4 pt-2 animate-in fade-in duration-300 text-left">
                        
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
                          <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-2 truncate">
                            📋 Listagem Completa de Cartas Escolhidas por Inteligência Espiritual:
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {revealedIndices.map((deckV, idx) => {
                              const card = cardMapping[deckV];
                              if (!card) return null;
                              return (
                                <div key={idx} className="flex gap-2.5 items-start p-2 bg-slate-900/60 rounded-xl border border-slate-850 text-xs">
                                  <span className="w-5 h-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="space-y-0.5">
                                    <h5 className="font-bold text-slate-200">
                                      {card.cardName} 
                                      {activeMode === 'semanal' && (
                                        <span className="text-[9px] font-mono text-amber-500 ml-1.5 font-normal">
                                          ({getWeeklyPositionLabel(idx)})
                                        </span>
                                      )}
                                    </h5>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                      <strong>Significado Prático:</strong> {card.uprightMeaning} — <strong>Seu conselho:</strong> {card.advice}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* IA Prediction trigger */}
                        {!interpretation && (
                          <div className="pt-2">
                            <button
                              onClick={handleInterpretWithAI}
                              disabled={isInterpreting}
                              className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase transition duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                activeMode === 'inteligente'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                                  : activeMode === 'amor'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                                    : activeMode === 'semanal'
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-400/30 hover:bg-amber-500/25'
                                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25'
                              }`}
                            >
                              {isInterpreting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Canalizando Interpretação Real de Orbia por IA...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  Revelar Leitura Humana da Taróloga Real
                                </>
                              )}
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}
              </>
            )}

          </div>

          {/* AI Result Box Display */}
          <AnimatePresence>
            {interpretation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`p-6 rounded-3xl border text-left space-y-4 shadow-xl ${
                  activeMode === 'inteligente'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : activeMode === 'amor'
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : activeMode === 'semanal'
                        ? 'bg-amber-500/10 border-amber-450/40 shadow-amber-500/5'
                        : 'bg-purple-500/5 border-purple-500/20'
                }`}
              >
                
                {/* Result header */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${
                      activeMode === 'inteligente' || activeMode === 'semanal' ? 'text-amber-400' : activeMode === 'amor' ? 'text-rose-400' : 'text-purple-400'
                    }`} />
                    <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-100">
                      Canalização Real da Taróloga Orbia
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-850 text-[8px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Sessão Ativa
                  </span>
                </div>

                {/* Main interpretational text */}
                <div className="space-y-3 leading-relaxed text-xs font-sans text-slate-300">
                  {interpretation.split('\n').map((para, pidx) => {
                    const cleanPara = para.trim();
                    if (!cleanPara) return null;
                    return (
                      <p key={pidx} className="indent-2">
                        {cleanPara}
                      </p>
                    );
                  })}
                </div>

                {/* Specific Spiritual guidance of defense, herbs or prayers */}
                {guidance && (
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850/60 space-y-1.5">
                    <span className="text-[9px] font-mono text-amber-405 uppercase tracking-widest font-extrabold block flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
                      Decreto Sagrado de Proteção & Alinhamento Semanal:
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed">
                      "{guidance}"
                    </p>
                  </div>
                )}

                {/* Quick informational banner explaining real tarot values */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/30 border border-slate-850/30 text-[10px] text-slate-500">
                  <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <p className="leading-normal font-sans">
                    Lembre-se que o Tarot é um espelho dinâmico. Essa consulta foi consagrada para reestruturar seu dia/semana. Suas decisões livres e orações de blindagem formam a linha do tempo do seu amanhã com soberania.
                  </p>
                </div>

                {/* Show clean reset ONLY if cooldown is not active (i.e., we just drafted it) */}
                {!cooldowns[activeMode] && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleResetDraw}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-semibold font-mono text-slate-400 transition hover:text-slate-205 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Visualizar Nova Tiragem
                    </button>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: "Como o Tarot funciona?" + Mistic guidance (5 cols) */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          
          {/* Card: Como o Tarot Funciona */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805 space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-slate-850/60 font-sans">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              Como o Tarot funciona?
            </h3>

            <div className="space-y-4 text-xs font-sans text-slate-400 leading-relaxed">
              <p>
                {userName ? <>Olá, <span className="text-amber-400 font-bold">{userName}</span>. </> : <>Olá. </>}Lembre-se de que o Tarot é uma ferramenta de autoconhecimento que deve ser usada com responsabilidade, quando você precisar se conectar mais profundamente com as forças que regem o universo.
              </p>

              <p>
                Fazer uma consulta trará revelações que poderão influenciar a linha do tempo de sua vida, portanto, reflita sobre o que lhe foi transmitido de forma intuitiva mas ao mesmo tempo consciente. A carta escolhida é a que possui mais afinidade com o seu momento ou pergunta e traz a orientação mais apropriada. Mesmo que você não receba a resposta que gostaria, não é recomendado repetir a consulta no mesmo instante. Releia o conteúdo da carta e reflita sobre a mensagem que lhe foi transmitida, pois é a que traz o melhor conselho para você agora.
              </p>

              <p>
                Saiba que o Tarot é um espelho da nossa alma e reflete todo o espectro da experiência humana através de arquétipos. É uma das conexões mais antigas entre os seres humanos e as divindades, tendo o papel de nos aproximar de algo superior. Seu estudo representa uma viagem de descoberta interior, onde passamos a conhecer melhor a nós mesmos e o atual momento o qual estamos inseridos. É um oráculo que caminha lado a lado com a astrologia e a alquimia, onde em suas cartas há uma correspondência alquímica, um signo astrológico e um número para cada arquétipo. As cartas podem ser consideradas uma jornada que nos ajuda a obter uma melhor compreensão do passado, presente e futuro.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-bold">Sabedoria Astrológica Sagrada</span>
              </div>
              <span className="text-[10px] font-mono text-slate-550">Orbia 2026</span>
            </div>
          </div>

          {/* Sintonizadores Auxiliares Card */}
          <div className="p-5 rounded-3xl bg-slate-950/40 border border-slate-850 space-y-3">
            <h4 className="text-[10px] font-mono text-slate-450 uppercase font-black tracking-wider text-left">Conselho Alquímico do Dia</h4>
            <div className="space-y-2 text-left">
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                "Não apresse os eventos sagrados do amanhã. A energia da Lua lembra que as ilusões e a inveja de terceiros se dissipam na névoa quando nos fechamos em orações e tomamos banho de sálvia ou arruda."
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-505/15 text-[8px] font-mono rounded text-amber-400 text-[8.5px] font-bold">
                  Sálvia & Prata
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-505/15 text-[8px] font-mono rounded text-emerald-400 text-[8.5px] font-bold">
                  Defumação Activa
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
