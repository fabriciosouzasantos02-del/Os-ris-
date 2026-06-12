import React, { useState } from 'react';
import { 
  Activity, Award, Calendar, Sparkles, ShieldCheck, BookOpen, 
  DollarSign, Heart, Users, Star, Moon, Home, Eye, Sliders,
  Compass, AlertCircle, TrendingUp, Sparkle, ArrowRight, Check, 
  Clock, Zap, Smile, Flame, Shield, HelpCircle, MessageSquare, Send, Bell, X
} from 'lucide-react';
import SocialCompatibility from './SocialCompatibility';
import { generatePersonalizedProsperityMap } from './prosperityEngine';
import { generateDailyPrediction } from './dailyPredictionsEngine';

function getLifePathNumber(birthDate: string): number {
  if (!birthDate) return 8; // default fallback
  const digits = birthDate.replace(/\D/g, '');
  let sum = digits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

function getZodiacSign(dateStr: string): string {
  if (!dateStr) return "Aquário";
  try {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Peixes";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
    return "Capricórnio";
  } catch {
    return "Aquário";
  }
}

interface UserDashboardPortalProps {
  user: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthCity: string;
    hasCreatedMap?: boolean;
    isPremium?: boolean;
    email?: string;
    profilePhoto?: string;
  };
  scorePoints: number;
  setScorePoints: React.Dispatch<React.SetStateAction<number>>;
  dailyMissions: Array<{
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    points: number;
    benefit?: string;
    benefitExplanation?: string;
  }>;
  setDailyMissions: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    points: number;
    benefit?: string;
    benefitExplanation?: string;
  }>>>;
  onRequestCreateMap?: () => void;
  dreamsHistory?: any[];
}

export default function UserDashboardPortal({
  user,
  scorePoints,
  setScorePoints,
  dailyMissions,
  setDailyMissions,
  onRequestCreateMap,
  dreamsHistory = []
}: UserDashboardPortalProps) {
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Viajante';
  const zodiacSign = getZodiacSign(user?.birthDate);
  const lifePathNumber = getLifePathNumber(user?.birthDate);

  const personalProsperity = generatePersonalizedProsperityMap(
    user?.hasCreatedMap ? user.birthDate : "1997-02-11",
    getZodiacSign(user?.birthDate),
    user?.hasCreatedMap ? user.name : "",
    new Date()
  );

  // Interactive states
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(9);

  const selectedDayPrediction = generateDailyPrediction(
    user?.hasCreatedMap ? user.birthDate : "1997-02-11",
    getZodiacSign(user?.birthDate),
    user?.hasCreatedMap ? user?.name : "",
    selectedCalendarDay - 1,
    new Date()
  );

  // Navigation tabs inside User Portal
  const [areaSubTab, setAreaSubTab] = useState<
    'universo_mostrando' | 'radar' | 'oportunidades_hoje' | 'painel_mes' | 
    'calendario' | 'cores' | 'amuletos' | 'mensagem' | 'prosperidade' | 
    'amor' | 'relacionamentos' | 'compatibilidade_social' | 'desenvolvimento' | 'sonhos' | 'energia_casa'
  >('universo_mostrando');

  const [activeCalendarFilter, setActiveCalendarFilter] = useState<string>('todos');
  const [selectedOpportunityArea, setSelectedOpportunityArea] = useState<string>('dinheiro');
  const [universoSintonizado, setUniversoSintonizado] = useState<boolean>(false);

  // Weekly Missions State
  const [weeklyMissions, setWeeklyMissions] = useState([
    { id: "w1", title: "Esta semana tente resolver uma pendência antiga", description: "Identifique uma pendência material ou burocrática acumulada e tome uma ação para resolvê-la, liberando fluxo de Saturno.", isCompleted: false, points: 150 },
    { id: "w2", title: "Esta semana fortaleça um relacionamento importante", description: "Envie uma mensagem genuína de carinho ou faça um gesto de consideração a alguém do seu círculo íntimo.", isCompleted: false, points: 120 },
    { id: "w3", title: "Esta semana dedique tempo ao aprendizado", description: "Invista pelo menos 1 hora em um livro, curso ou áudio de meditação voltado ao seu desenvolvimento pessoal.", isCompleted: false, points: 100 }
  ]);

  // Osiris Intelligent AI System States
  const [osirisDashboard, setOsirisDashboard] = useState<any>(null);
  const [osirisLoading, setOsirisLoading] = useState<boolean>(true);
  const [osirisOnlineAlert, setOsirisOnlineAlert] = useState<boolean>(true);
  const [osirisChatMessages, setOsirisChatMessages] = useState<Array<{ sender: 'user' | 'osiris', text: string }>>([
    { sender: 'osiris', text: `Olá, meu caro buscador stelar! Eu sou OSÍRIS, seu mentor astrológico supremo e guia de cura energética. Estou em plena sintonia com suas frequências cósmicas de hoje para alinhar seu dharma e afastar de forma precisa as negatividades kármicas. O que você gostaria de desvendar no momento? Me pergunte sobre o clima, biorritmo celular ou seus sonhos profundos.` }
  ]);
  const [osirisChatInput, setOsirisChatInput] = useState<string>('');
  const [osirisChatSending, setOsirisChatSending] = useState<boolean>(false);

  React.useEffect(() => {
    if (!user || !user.hasCreatedMap) return;
    
    // Fetch daily missions
    const fetchMissions = async () => {
      try {
        const res = await fetch("/api/astrology/daily-missions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile: user })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.missions)) {
            // Merge isCompleted from current dailyMissions if IDs match (to retain completion)
            const updated = data.missions.map((m: any) => {
              const matched = dailyMissions.find(curr => curr.id === m.id);
              return {
                ...m,
                isCompleted: matched ? matched.isCompleted : false
              };
            });
            setDailyMissions(updated);
          }
        }
      } catch (err) {
        console.warn("Falha ao carregar missões dinâmicas do Osíris:", err);
      }
    };

    // Fetch Osiris dashboard priority & alerts
    const fetchOsirisDashboard = async () => {
      setOsirisLoading(true);
      try {
        const defaultBiorhythm = { physical: 78, emotional: 82, intellectual: 65 };
        const defaultWeather = { temperature: 24, condition: "Parcialmente Nublado" };
        const locationStr = user?.birthCity || "São Paulo, SP";

        const res = await fetch("/api/osiris/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userProfile: user,
            weather: defaultWeather,
            biorhythm: defaultBiorhythm,
            location: locationStr,
            lastDream: dreamsHistory && dreamsHistory.length > 0 ? dreamsHistory[0] : null
          })
        });
        if (res.ok) {
          const data = await res.json();
          setOsirisDashboard(data);
        }
      } catch (err) {
        console.warn("Falha ao carregar dashboard inteligente do Osíris:", err);
      } finally {
        setOsirisLoading(false);
      }
    };

    fetchMissions();
    fetchOsirisDashboard();
  }, [user]);

  const handleSendOsirisMessage = async () => {
    if (!osirisChatInput.trim() || osirisChatSending) return;
    const userMsgText = osirisChatInput;
    setOsirisChatInput('');
    setOsirisChatMessages(prev => [...prev, { sender: 'user', text: userMsgText }]);
    setOsirisChatSending(true);

    try {
      const defaultBiorhythm = { physical: 78, emotional: 82, intellectual: 65 };
      const defaultWeather = { temperature: 24, condition: "Parcialmente Nublado" };
      const locationStr = user?.birthCity || "São Paulo, SP";

      const res = await fetch("/api/osiris/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...osirisChatMessages.map(m => ({ sender: m.sender === 'user' ? 'user' : 'assistant', text: m.text })),
            { sender: 'user', text: userMsgText }
          ],
          userProfile: user,
          weather: defaultWeather,
          biorhythm: defaultBiorhythm,
          location: locationStr,
          dreams: dreamsHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.response) {
          setOsirisChatMessages(prev => [...prev, { sender: 'osiris', text: data.response }]);
          return;
        }
      }
      throw new Error("Resposta inválida do Osíris");
    } catch (err) {
      console.warn("Erro no chat com Osíris:", err);
      setOsirisChatMessages(prev => [
        ...prev,
        { sender: 'osiris', text: `Desculpe, sinto uma instabilidade temporária nas esferas celestes. Mas recorde: a força solar brilha firme em sua alma hoje.` }
      ]);
    } finally {
      setOsirisChatSending(false);
    }
  };

  // RESTRICTED VIEW: ÁREA PESSOAL SEM MAPA
  if (!user?.hasCreatedMap) {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-305 p-3 md:p-6 select-none max-w-7xl mx-auto">
        
        {/* 1. PERFIL CARD */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-850 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-600 rounded-full blur-xs opacity-55" />
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-amber-400/80 bg-slate-950 flex items-center justify-center">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover relative z-10" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl font-black text-amber-300 font-sans relative z-10">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-lg font-extrabold text-slate-100">{user.name || "Viajante Estelar"}</h2>
                <span className="w-fit mx-auto sm:mx-0 px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-[8.5px] font-mono font-bold text-amber-450 rounded-md">
                  Assinatura Premium Ativa
                </span>
              </div>
              <div className="text-slate-450 text-xs font-sans space-y-1">
                {user.email && <p>E-mail: <span className="font-mono text-slate-300">{user.email}</span></p>}
                <p>Status: <span className="text-amber-400 font-bold font-mono">Aguardando seu Mapa Primordial</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CONVITE PARA CRIAR O MAPA */}
        <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 p-6 rounded-3xl border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-black text-amber-450 rounded-lg uppercase tracking-wider">
              ALINHAMENTO COLETIVO GRATUITO
            </span>
            <h3 className="text-base md:text-lg font-black font-sans text-slate-100 tracking-tight">Sua Assinatura está Pronta. Sincronize seu Mapa Astral!</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Calcule as 12 ordens de casas sob o método clássico Placidus, as 10 distâncias angulares do Sol ao Meio do Céu, o guia numerológico de prosperidade e as sinergias sociais criptografadas.
            </p>
          </div>
          <button
            onClick={onRequestCreateMap}
            className="w-full md:w-auto shrink-0 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-600 rounded-xl text-xs font-black font-sans uppercase text-slate-950 shadow-lg tracking-wide hover:opacity-100 opacity-90 transition cursor-pointer active:scale-95"
          >
            Criar Meu Mapa Astral
          </button>
        </div>

        {/* 3. EXPLICAÇÃO DAS FUNCIONALIDADES */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest text-left">Guia de Portais e Funcionalidades Ativas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-left">
            {[
              { title: "Mapa Natal Placidus Completo", desc: "Mapeamento das 12 ordens de casas, posições exatas dos astros clássicos e modernos em relação ao horizonte e local de nascimento.", highlight: "CÁLCULO GEOMÉTRICO" },
              { title: "Sinergia Social & Compatibilidade", desc: "Varredura do ecossistema de usuários reais em afinidade afetiva, amizade, prosperidade e energia para sintonizar afinidades mutáveis.", highlight: "CONEXÃO REAL" },
              { title: "Radar do Dia & Biorritmo", desc: "Acompanhamento detalhado e dinâmico de suas oscilações moleculares e intelectuais com conselhos estratégicos atualizados.", highlight: "FALAS DIÁRIAS" },
              { title: "Conselheira Orbia", desc: "O auge da sabedoria integrada. Chat interativo e confidencial baseado no seu mapa natal para sanar anseios de carreira e propósitos.", highlight: "SUPORTE INDIVIDUAL" },
              { title: "Guia Semanal do Tarô", desc: "Sorteio consciente do arcano semanal orientador trazendo as diretrizes práticas para resguardo energético e expansão.", highlight: "ORÁCULO SEMANAL" },
              { title: "Vibrações de Prosperidade", desc: "Conheça seu caminho evolutivo numerológico, as cores auspiciosas, os amuletos recomendados e dias ideias para contratos.", highlight: "NUMEROLOGIA ATIVA" },
            ].map((func, i) => (
              <div key={i} className="bg-slate-900/30 p-5 rounded-2xl border border-slate-855 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.55">
                  <span className="text-[8px] font-mono text-amber-450 uppercase font-bold tracking-wide bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded-md">
                    {func.highlight}
                  </span>
                  <h4 className="font-bold text-slate-200 text-xs mt-2">{func.title}</h4>
                  <p className="text-[11px] text-slate-405 leading-relaxed font-normal">{func.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DEMONSTRAÇÕES ILUSTRATIVAS (POLISHED BLURRED PREVIEWS) */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest text-left font-bold">Demonstrações Ilustrativas Pré-Mapa</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
            
            {/* Mock Radar do Dia */}
            <div className="p-5 bg-slate-900/10 border border-slate-850/80 rounded-2xl space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10 text-center space-y-2 select-none">
                <span className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs">
                  🔒
                </span>
                <span className="font-bold text-xs text-amber-450 tracking-wide uppercase font-mono">Funcionalidade Bloqueada</span>
                <p className="text-[10px] text-slate-400 max-w-xs leading-normal">Crie seu mapa astral oficial para sintonizar e liberar seu biorritmo científico e estatísticas diárias.</p>
              </div>

              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">⚡ Radar do Dia</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              </div>
              <div className="space-y-3 opacity-25">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Energia Vital</span>
                    <span className="font-mono">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[92%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Produtividade Sideral</span>
                    <span className="font-mono">81%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[81%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Tarot Semanal */}
            <div className="p-5 bg-slate-900/10 border border-slate-850/80 rounded-2xl space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10 text-center space-y-2 select-none">
                <span className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs">
                  🔒
                </span>
                <span className="font-bold text-xs text-amber-450 tracking-wide uppercase font-mono">Funcionalidade Bloqueada</span>
                <p className="text-[10px] text-slate-400 max-w-xs leading-normal">Seu conselho do tarô semanal do destino requer as coordenadas geométricas do seu nascimento.</p>
              </div>

              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">🔮 Arcana Maior Semanal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-405" />
              </div>
              <div className="flex gap-4 items-center opacity-25">
                <div className="w-12 h-18 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-lg select-none font-sans font-bold text-amber-400/50">
                  ♚
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-slate-350 text-xs font-sans">O Imperador (Arcano IV)</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">Autoridade, ordem prática e estabilidade rígida para expandir metas materiais organizadas.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // Toggle helpers
  const handleToggleDailyMission = (id: string) => {
    setDailyMissions(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.isCompleted;
        setScorePoints(s => next ? s + m.points : Math.max(0, s - m.points));
        return { ...m, isCompleted: next };
      }
      return m;
    }));
  };

  const handleToggleWeeklyMission = (id: string) => {
    setWeeklyMissions(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.isCompleted;
        setScorePoints(s => next ? s + m.points : Math.max(0, s - m.points));
        return { ...m, isCompleted: next };
      }
      return m;
    }));
  };

  // 1. DATA DEFINITIONS FOR DISPENSATION & TENDENCIES
  const opportunityRadarValues: Record<string, { val: number, bg: string, color: string, text: string, conselho: string }> = {
    dinheiro: { 
      val: 85, bg: 'bg-emerald-500/10 border-emerald-500/35', color: 'text-emerald-400', 
      text: 'Oportunidades de ganhos secundários intelectuais sob ar ativo.',
      conselho: 'O trânsito atual favorece a formatação de serviços de mentoria ou rascunhos de propostas comerciais. Fique atento a propostas nas terças ou quintas-feiras.'
    },
    amor: { 
      val: 68, bg: 'bg-pink-500/10 border-pink-500/35', color: 'text-pink-400', 
      text: 'Magnetismo em alta, facilitando conexões profundas e românticas.',
      conselho: 'Com Vênus emanando trígonos estelares, desfaça os muros analíticos e compartilhe desejos sinceros. Sexta-feira à noite é o melhor período para conversas afetivas.'
    },
    estudos: { 
      val: 94, bg: 'bg-sky-500/10 border-sky-505/35', color: 'text-sky-400', 
      text: 'Retenção intelectual extraordinária e foco linear ativado.',
      conselho: 'Sua mente possui uma facilidade única hoje para absorver conceitos metafísicos, matemáticos e científicos. Ótimo dia para devorar livros ou rascunhar códigos.'
    },
    trabalho: { 
      val: 81, bg: 'bg-indigo-500/10 border-indigo-500/35', color: 'text-indigo-400', 
      text: 'Capacidade de estruturação mecânica e conclusão de pendências.',
      conselho: 'A influência do Caminho de Vida 8 ressoa para estabilizar as tarefas administrativas do seu negócio. Execute sem procrastinar.'
    },
    criatividade: { 
      val: 90, bg: 'bg-amber-500/10 border-amber-500/35', color: 'text-amber-400', 
      text: 'Canal mental de ideias originais e soluções inovadoras fluido.',
      conselho: 'Não filtre seus insights à primeira vista. Deixe o ar soprar novas ideias sem compromisso no papel de rascunho.'
    },
    networking: { 
      val: 75, bg: 'bg-teal-500/10 border-teal-500/35', color: 'text-teal-400', 
      text: 'Facilidade para gerar engajamento em causas sociais e projetos coletivos.',
      conselho: 'Entre em contato com mentores ou parceiros adormecidos. Compartilhar ideais éticos fortalece o Sol em Aquário.'
    },
    espiritualidade: { 
      val: 88, bg: 'bg-purple-500/10 border-purple-500/35', color: 'text-purple-400', 
      text: 'Frequência onírica aberta e trânsito favorável a rituais astrológicos.',
      conselho: 'Medite com cristais de Sodalita ou Selenita. Suas conexões áuricas com esferas superiores estão extremamente receptivas hoje.'
    }
  };

  // 2. INTELLIGENT CALENDAR CONFIGURATION
  // Day categories maps for June 2026
  const calendarCategories = [
    { id: 'todos', label: 'Todos os Dias', icon: Calendar, color: 'text-slate-400', list: [] },
    { id: 'produtividade', label: 'Produtividade', icon: Activity, color: 'text-orange-400', list: [3, 7, 12, 15, 21, 28] },
    { id: 'descanso', label: 'Descanso', icon: ShieldCheck, color: 'text-teal-400', list: [6, 11, 14, 20, 24, 30] },
    { id: 'familia', label: 'Família', icon: Users, color: 'text-blue-400', list: [2, 9, 16, 23, 29] },
    { id: 'encontros', label: 'Encontros', icon: Heart, color: 'text-rose-400', list: [5, 10, 18, 22, 27] },
    { id: 'diversao', label: 'Diversão', icon: Smile, color: 'text-yellow-405', list: [4, 13, 17, 25] },
    { id: 'entrevistas', label: 'Entrevistas', icon: Sparkle, color: 'text-indigo-400', list: [1, 8, 19, 26] },
    { id: 'vendas', label: 'Vendas', icon: DollarSign, color: 'text-emerald-400', list: [3, 12, 18, 28] },
    { id: 'investimentos', label: 'Investimentos', icon: Zap, color: 'text-amber-500', list: [8, 15, 22] },
    { id: 'viagens', label: 'Viagens', icon: Compass, color: 'text-sky-400', list: [10, 20, 29] },
    { id: 'mudancas', label: 'Mudanças', icon: Flame, color: 'text-rose-500', list: [11, 25] },
    { id: 'projetos', label: 'Iniciar Projetos', icon: Award, color: 'text-pink-400', list: [1, 7, 15, 21] },
    { id: 'contratos', label: 'Assinar Contratos', icon: BookOpen, color: 'text-purple-400', list: [5, 12, 22] },
    { id: 'conversas', label: 'Conversas Difíceis', icon: AlertCircle, color: 'text-red-450', list: [9, 16, 30] },
    { id: 'estudos', label: 'Estudos', icon: Star, color: 'text-emerald-505', list: [2, 6, 13, 19, 27] },
    { id: 'exercicios', label: 'Exercícios Físicos', icon: Activity, color: 'text-amber-400', list: [4, 11, 18, 25] },
    { id: 'meditacao', label: 'Meditação', icon: Eye, color: 'text-teal-400', list: [6, 14, 20, 28] },
    { id: 'espiritualidade', label: 'Espiritualidade', icon: Sparkles, color: 'text-purple-400', list: [8, 17, 26] },
    { id: 'compras', label: 'Compras Importantes', icon: DollarSign, color: 'text-amber-450', list: [5, 15, 22] }
  ];

  const getCalendarDayIconAndBg = (day: number) => {
    if (activeCalendarFilter === 'todos') {
      if (day % 6 === 0) return { sym: "🌙", label: "Descanso" };
      if (day % 6 === 1) return { sym: "🎯", label: "Produtividade" };
      if (day % 6 === 2) return { sym: "💖", label: "Encontros" };
      if (day % 6 === 3) return { sym: "⚡", label: "Avisos" };
      if (day % 6 === 4) return { sym: "💸", label: "Financeiro" };
      return { sym: "💬", label: "Social" };
    }

    const matchedCat = calendarCategories.find(c => c.id === activeCalendarFilter);
    if (matchedCat && matchedCat.list.includes(day)) {
      return { sym: "⭐️", label: matchedCat.label, isMatched: true };
    }
    return { sym: "", label: "", isMatched: false };
  };

  const getDetailedDayGuidance = (day: number) => {
    const matchedFavorableTypes: string[] = [];
    calendarCategories.forEach(cat => {
      if (cat.id !== 'todos' && cat.list.includes(day)) {
        matchedFavorableTypes.push(cat.label);
      }
    });

    return {
      favorable: matchedFavorableTypes.length > 0 ? matchedFavorableTypes.join(', ') : 'Influências Gerais Neutras',
      guidance: day % 2 === 0 
        ? "Dia dominado pela energia reflexiva da Lua. Perfeito para estruturar ideias antigas de negócios ou revisar o fluxo das finanças com critério saturnino. O cansaço é sagrado, respeite as pausas naturais."
        : "Dia marcado pelo impulso solar do elemento Ar. Excelente para expressar verbalmente propostas comerciais, debater ideias de forma descontraída com parceiros ou ler sobre espiritualidade onírica.",
      tip: day % 3 === 0 
        ? "Acenda um incenso de sândalo de manhã para sintonizar a sabedoria e limpe sua mesa."
        : day % 3 === 1 
          ? "Evite comprar itens supérfluos no final do dia. Aguarde 24 horas antes de decidir."
          : "Faça alongamentos respiratórios intensificados de 5 minutos logo ao despertar."
    };
  };

  return (
    <div className="space-y-6">
      
      {/* FEATURED PORTAL HEADLINE & UNIVERSE SHOWCASE HIGHLIGHT BANNER */}
      <div className="relative p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-850 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="text-left space-y-1 z-10 max-w-xl">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Portal Ativo Sincronizado
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight leading-snug">
            Acelere Seus Objetivos, Navegue pelos Portais Ativos
          </h2>
        </div>

        {/* Highlighted Universe Spot Box */}
        <button
          type="button"
          onClick={() => setAreaSubTab('painel_mes')}
          className="relative group p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950/90 border border-amber-500/35 hover:border-amber-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 transition-all duration-300 w-full md:w-auto shrink-0 z-10 text-left shadow-[0_0_25px_rgba(245,158,11,0.03)] focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/10 to-indigo-500/20 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Eye className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-400 tracking-wide uppercase flex items-center gap-1 flex-wrap font-sans">
                🪐 Veja o que o universo quer te mostrando
              </span>
              <p className="text-[9px] text-slate-400 font-medium">Painel do mês e orientações cósmicas.</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider self-end sm:self-center shrink-0 transition shadow-md hover:shadow-amber-500/10 hover:scale-102">
            Ver tudo →
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
        {/* 1. LEFT SIDEBAR NAVIGATION OR MOBILE DROPDOWN */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          {/* Mobile Dropdown Category Selector */}
          <div className="lg:hidden animate-in fade-in duration-300">
            <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-black tracking-wide">
              Acelere Seus Objetivos, Navegue pelos Portais Ativos
            </label>
            <div className="relative">
              <select
                value={areaSubTab}
                onChange={(e) => setAreaSubTab(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-black text-slate-200 tracking-wider focus:outline-hidden cursor-pointer"
              >
                <optgroup label="🌌 Revelação Semanal">
                  <option value="universo_mostrando">🪐 Veja o que o universo quer te mostrando</option>
                </optgroup>
                <optgroup label="📈 Sinais & Oportunidades do Dia">
                  <option value="radar">⚡ Radar do Dia</option>
                  <option value="oportunidades_hoje">🎯 Radar de Oportunidades (0-100)</option>
                </optgroup>
                <optgroup label="🗓️ Previsões & Ciclos do Mês">
                  <option value="painel_mes">🌙 Painel do Mês</option>
                  <option value="calendario">📅 Calendário Inteligente</option>
                  <option value="cores">🎨 Cores do Mês</option>
                  <option value="mensagem">✉️ Mensagem e Avisos</option>
                </optgroup>
                <optgroup label="💎 Áreas de Foco">
                  <option value="prosperidade">💸 Prosperidade & Dinheiro</option>
                  <option value="amor">💖 Amor & Romance</option>
                  <option value="compatibilidade_social">👥 Sinergia Social & Compatibilidade</option>
                  <option value="relacionamentos">👥 Relacionamentos Sociais</option>
                  <option value="desenvolvimento">🌱 Desenvolvimento Pessoal</option>
                </optgroup>
                <optgroup label="🌱 Campo Energético">
                  <option value="energia_casa">🏡 Energia da Casa</option>
                  <option value="sonhos">🌙 Centro de Sonhos</option>
                </optgroup>
              </select>
            </div>
          </div>

        {/* Desktop Styled Sidebar Navigation inside a bento container */}
        <div className="hidden lg:block space-y-4 sticky top-6">
          <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-850/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                Navegação Cósmica
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-4">
              {[
                {
                  group: "Oráculo de Entrada",
                  items: [
                    { id: 'universo_mostrando', label: 'Elias & Sinais', icon: Eye, color: 'text-purple-400', bg: 'hover:bg-purple-500/5' }
                  ]
                },
                {
                  group: "Estatísticas Diárias",
                  items: [
                    { id: 'radar', label: 'Radar do Dia', icon: Activity, color: 'text-rose-400', bg: 'hover:bg-rose-500/5' },
                    { id: 'oportunidades_hoje', label: 'Radar Oportunidades', icon: Compass, color: 'text-amber-400', bg: 'hover:bg-amber-500/5' }
                  ]
                },
                {
                  group: "Planejamento Astrológico",
                  items: [
                    { id: 'painel_mes', label: 'Painel do Mês', icon: Calendar, color: 'text-teal-400', bg: 'hover:bg-teal-500/5' },
                    { id: 'calendario', label: 'Calendário Inteligente', icon: Calendar, color: 'text-sky-400', bg: 'hover:bg-sky-500/5' },
                    { id: 'cores', label: 'Cores do Mês', icon: Sparkles, color: 'text-indigo-400', bg: 'hover:bg-indigo-500/5' },
                    { id: 'mensagem', label: 'Mensagem & Alertas', icon: BookOpen, color: 'text-pink-400', bg: 'hover:bg-pink-500/5' }
                  ]
                },
                {
                  group: "Pilares do Destino",
                  items: [
                    { id: 'prosperidade', label: 'Prosperidade e Capital', icon: DollarSign, color: 'text-emerald-400', bg: 'hover:bg-emerald-505/5' },
                    { id: 'amor', label: 'Amor & Intimidade', icon: Heart, color: 'text-red-400', bg: 'hover:bg-red-500/5' },
                    { id: 'compatibilidade_social', label: 'Sinergia Social', icon: Users, color: 'text-amber-400', bg: 'hover:bg-amber-500/5' },
                    { id: 'relacionamentos', label: 'Relacionamentos', icon: Users, color: 'text-cyan-400', bg: 'hover:bg-cyan-500/5' },
                    { id: 'desenvolvimento', label: 'Desenv. Pessoal', icon: Star, color: 'text-yellow-405', bg: 'hover:bg-yellow-500/5' },
                    { id: 'energia_casa', label: 'Energia da Casa', icon: Home, color: 'text-indigo-405', bg: 'hover:bg-indigo-500/5' },
                    { id: 'sonhos', label: 'Centro de Sonhos', icon: Moon, color: 'text-pink-400', bg: 'hover:bg-pink-500/5' }
                  ]
                }
              ].map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  <span className="text-[8px] font-mono font-black text-slate-600 block uppercase px-2 tracking-widest leading-none mb-1">{group.group}</span>
                  <div className="space-y-0.5">
                    {group.items.map((sub) => {
                      const Icon = sub.icon;
                      const isSelected = areaSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setAreaSubTab(sub.id as any)}
                          className={`w-full px-3 py-1.5 rounded-xl text-[10.5px] font-bold tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 border border-slate-800 text-slate-100 shadow-xs scale-102 font-black'
                              : `text-slate-400 border border-transparent ${sub.bg} hover:text-slate-205`
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${sub.color}`} />
                            <span>{sub.label}</span>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* 2. MAIN DASHBOARD CONTENT AREA */}
        <div className="lg:col-span-8 xl:col-span-9 min-h-[500px]">
          <div className="animate-in fade-in duration-300">
            {areaSubTab === 'universo_mostrando' && (
            <div className="space-y-6">
              {/* OSÍRIS ALIGNED WELCOME & INTUITIVE ONLINE ACTION BANNER */}
              {osirisOnlineAlert && osirisDashboard?.contextMessage && (
                <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="absolute top-0 left-0 h-full w-1 bg-amber-500" />
                  <div className="space-y-0.5 text-left pl-3">
                    <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Mensagem Contextual de Osíris</span>
                    <p className="text-xs text-slate-250 leading-relaxed font-sans">{osirisDashboard.contextMessage.sentence}</p>
                    <p className="text-xs text-amber-200/90 font-bold font-serif">{osirisDashboard.contextMessage.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const chatEl = document.getElementById("osiris-chat-box");
                        if (chatEl) {
                          chatEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg tracking-wider transition uppercase"
                    >
                      Perguntar Agora
                    </button>
                    <button
                      type="button"
                      onClick={() => setOsirisOnlineAlert(false)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
                      title="Fechar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* MAIN METRIC: PRIORIDADE DO DIA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PART A: SINGLE KEY DAILY FOCUS CARD */}
                <div className="bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-950 p-6 rounded-3xl border border-indigo-500/20 shadow-lg relative overflow-hidden text-left flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 font-extrabold rounded-lg uppercase tracking-wider">
                        ★ Prioridade do Dia: {osirisDashboard?.prioridadeDia?.category || "Espiritualidade"}
                      </span>
                      <span className="text-[10px] font-mono text-amber-500 font-extrabold flex items-center gap-1">
                        ✦ Sincronia: {osirisDashboard?.prioridadeDia?.rating || "4.9"}/5
                      </span>
                    </div>

                    {osirisLoading ? (
                      <div className="space-y-2 animate-pulse py-4">
                        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-100 tracking-tight font-sans">
                          {osirisDashboard?.prioridadeDia?.title || "Sintonia de Foco Celular"}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {osirisDashboard?.prioridadeDia?.description || `Sua bússola biológica e o trânsito do Sol em de ${zodiacSign} orientam seu fluxo prático nesta coordenada.`}
                        </p>
                        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl mt-3">
                          <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-0.5">Conselho do Místico</span>
                          <p className="text-[11px] text-slate-300 font-serif italic leading-relaxed">
                            "{osirisDashboard?.prioridadeDia?.advice || 'Seja vigilante ao seu biorritmo. Pequenas reflexões de 3 minutos trarão alinhamento.'}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-900/50 flex items-center justify-between mt-4">
                    <span className="text-[9px] text-slate-500 font-mono">Orientação Única Diária de Osíris</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* PART B: OFFLINE PUSH NOTIFICATIONS LOG (SIMULATED COPT CHART) */}
                <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-850 text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500 animate-swing" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">Fila Push Offline (Hoje)</span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">Últimas 3 Notificações</span>
                    </div>

                    {osirisLoading ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-10 bg-slate-900 rounded-xl"></div>
                        <div className="h-10 bg-slate-900 rounded-xl"></div>
                        <div className="h-10 bg-slate-900 rounded-xl"></div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {osirisDashboard?.offlineNotifications?.map((notif: any) => (
                          <div key={notif.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-850/40 flex items-start gap-2.5 hover:border-slate-800 transition">
                            <span className="text-xs mt-0.5 shrink-0">
                              {notif.type === 'transit' ? '🪐' : notif.type === 'lune' ? '🌙' : '✨'}
                            </span>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <h5 className="text-[10px] font-extrabold text-slate-205 truncate">{notif.title}</h5>
                                <span className="text-[8px] text-slate-500 font-mono shrink-0">{notif.time}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{notif.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[8.5px] text-slate-500 font-sans mt-3">★ Mensagens despachadas pelas esferas celestes enquanto você estava em desconexão prática.</p>
                </div>
              </div>

              {/* SECTION: OSÍRIS CHAT ASSISTANT COMPANION */}
              <div id="osiris-chat-box" className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-850 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-xs animate-ping" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block z-10 relative" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold font-mono text-slate-205 uppercase tracking-widest">Osíris: Mentor e Conselheiro Live</h3>
                      <p className="text-[9.5px] text-slate-500">Sincronizado aos seus Transitos Estelares, Temperatura do ar e Biorritmo celular</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 rounded">
                    Sábio Ativo
                  </span>
                </div>

                {/* Osiris Chat History Stream */}
                <div className="h-[250px] overflow-y-auto px-2 space-y-3 flex flex-col scrollbar-thin scrollbar-thumb-slate-850 text-left">
                  {osirisChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed font-sans ${
                        msg.sender === 'user'
                          ? 'bg-amber-600/10 border border-amber-500/25 text-amber-100 self-end'
                          : 'bg-slate-950/90 border border-slate-850/60 text-slate-300 self-start'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1 font-mono text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>{msg.sender === 'user' ? 'Você' : 'Osíris'}</span>
                        <span>•</span>
                        <span>Agora</span>
                      </div>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  ))}
                  {osirisChatSending && (
                    <div className="bg-slate-950/90 border border-slate-850/60 text-slate-400 self-start rounded-2xl p-3 text-[11px] max-w-[80%] flex items-center gap-1.5 font-mono animate-pulse">
                      <span>✦ Osíris está sintonizando energias...</span>
                    </div>
                  )}
                </div>

                {/* Osiris Chat Box Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendOsirisMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={osirisChatInput}
                    onChange={(e) => setOsirisChatInput(e.target.value)}
                    placeholder="Pergunte ao Osíris sobre seus trânsitos, clima ou sonhos de hoje..."
                    disabled={osirisChatSending}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-205 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={osirisChatSending || !osirisChatInput.trim()}
                    className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:opacity-50 text-slate-950 rounded-xl transition cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: RADAR DO DIA */}
          {areaSubTab === 'radar' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                    Radar do dia
                  </h3>
                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono font-bold text-rose-455 rounded-lg">
                    Atualização Diária
                  </span>
                </div>

                <div className="space-y-4 font-sans text-left">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/60">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Frequência Dominante Celular</span>
                    <span className="text-xs font-black text-rose-455 block tracking-wide mt-1">
                      Intuição Harmoniosa & Foco Singular (Sol e Mercúrio em Trígono)
                    </span>
                  </div>

                  {/* The 5 Metrics */}
                  <div className="space-y-3 pt-1">
                    {[
                      { label: 'Energia Vital', val: 92, grad: 'from-amber-500 to-orange-500', desc: 'Sua vitalidade celular física e impulso vital ativo sob sua regência estelar.' },
                      { label: 'Produtividade', val: 88, grad: 'from-indigo-500 to-purple-600', desc: 'Retenção intelectual e foco singular de mercúrio ativo.' },
                      { label: 'Relacionamentos', val: 74, grad: 'from-pink-500 to-rose-550', desc: 'Expressão de afetos, diplomacia e conexões áuricas com base em Vênus.' },
                      { label: 'Organização', val: 81, grad: 'from-emerald-500 to-teal-500', desc: 'Estruturação de afazeres diários sob o Caminho de Vida 8.' },
                      { label: 'Bem-estar', val: 90, grad: 'from-sky-400 to-indigo-500', desc: 'Centramento emocional e quietude mental do respirar.' }
                    ].map((metric, i) => (
                      <div key={i} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold">
                          <span>{metric.label}</span>
                          <span className="text-slate-205">{metric.val}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${metric.grad}`} style={{ width: `${metric.val}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal italic">{metric.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RADAR DE OPORTUNIDADES (DAILY 0 TO 100 SLIDERS) */}
          {areaSubTab === 'oportunidades_hoje' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-500" />
                      Radar de oportunidades diárias
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Clique em cada área para obter direcionamento astrológico de aproveitamento das tendências hoje.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-400 rounded-lg shrink-0">
                    O Momento Atual
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  
                  {/* Left Column: Interactive Gauges */}
                  <div className="space-y-3">
                    {Object.entries(opportunityRadarValues).map(([key, data]) => {
                      const isSelected = selectedOpportunityArea === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedOpportunityArea(key)}
                          className={`w-full p-3.5 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected 
                              ? 'bg-slate-950 border-amber-500/40 shadow-xs' 
                              : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-mono font-black uppercase text-slate-300 flex items-center gap-1.5">
                              {key === 'dinheiro' && <DollarSign className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                              {key === 'amor' && <Heart className="w-3.5 h-3.5 text-pink-400 animate-pulse" />}
                              {key === 'estudos' && <Star className="w-3.5 h-3.5 text-sky-405 animate-pulse" />}
                              {key === 'trabalho' && <Award className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
                              {key === 'criatividade' && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                              {key === 'networking' && <Users className="w-3.5 h-3.5 text-teal-400 animate-pulse" />}
                              {key === 'espiritualidade' && <Moon className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
                              {key}
                            </span>
                            <span className={`text-xs font-mono font-black ${data.color}`}>{data.val} / 100</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full bg-linear-to-r from-slate-900 to-amber-400`} style={{ width: `${data.val}%` }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Detailed focused advice */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="pb-2 border-b border-slate-900 flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Conselho Especial Hoje</span>
                        <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 font-mono font-black text-[8px] uppercase">Foco Ativo</span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wide text-slate-100 flex items-center gap-1.5">
                          <span>Área focada: {selectedOpportunityArea.toUpperCase()}</span>
                        </h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-serif italic">
                          "{opportunityRadarValues[selectedOpportunityArea].text}"
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                          {opportunityRadarValues[selectedOpportunityArea].conselho}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 mt-4">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold mb-1">Ritual de Potencialização</span>
                      <p className="text-[10px] text-slate-405 leading-relaxed">
                        Coloque um guardanapo azul no bolso esquerdo ou use caneta de tinta preta para fixar as ações tomadas agora sob a influência desta vibração.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAINEL DO MÊS */}
          {areaSubTab === 'painel_mes' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      Painel do Mês de {personalProsperity.monthName} de {personalProsperity.year}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Seu mapa de forças, proteção e ressonâncias para atravessar o mês de {personalProsperity.monthName} em segurança vibracional.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-[9px] font-mono font-bold text-teal-400 rounded-lg shrink-0">
                    Mês Ativo
                  </span>
                </div>

                {/* Bento Grid layout of requested variables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  
                  {/* Keyword */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Palavra-Chave do Mês</span>
                    <span className="text-xs font-black text-teal-400 font-sans tracking-wide">EXPANSÃO SUTIL</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Cresça de forma diplomática respeitando os canais de silêncio do seu próprio ser.</p>
                  </div>

                  {/* Símbolo */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Símbolo Favorável</span>
                    <span className="text-xs font-black text-purple-400 font-sans tracking-wide">Heptagrama Sagrado (⭐️)</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Representa os sete caminhos de proteção que selam seu campo energético áurico.</p>
                  </div>

                  {/* Amuleto */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Amuleto Favorável</span>
                    <span className="text-xs font-black text-rose-455 font-sans tracking-wide">Escarabeu de Lápis-Lazúli</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Atua na proteção física, facilitando transações e banindo a exaustão acumulada.</p>
                  </div>

                  {/* Lucky Number */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Número da Sorte</span>
                    <span className="text-xs font-black text-amber-500 font-mono">82 (Sincronicidade {getLifePathNumber(user.birthDate)})</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Conecta seu Caminho de Vida com a energia realizadora do planeta Saturno.</p>
                  </div>

                  {/* Color */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Cor Favorável</span>
                    <span className="text-xs font-black text-indigo-400 font-sans">Azul Cobalto Real</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Promove serenidade mental no elemento Ar, eliminando dispersão cognitiva excessiva.</p>
                  </div>

                  {/* Environment */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Ambiente Favorável</span>
                    <span className="text-xs font-black text-cyan-400 font-sans">Bibliotecas ou Jardins de Lago</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Fomenta a absorção silenciosa de conhecimento e a desaceleração cardíaca.</p>
                  </div>

                  {/* Activity */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Atividade Favorável</span>
                    <span className="text-xs font-black text-green-400 font-sans">Meditação com Registro Escrito</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Escrever logo cedo no diário ajuda o cérebro de Aquário a não saturar de planos.</p>
                  </div>

                  {/* Challenge */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between col-span-1 sm:col-span-2">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Desafio Principal do Mês</span>
                    <span className="text-xs font-black text-red-400 font-sans">Dispersão e Excesso de Projetos Inacabados</span>
                    <p className="text-[9.5px] text-slate-405 mt-1 leading-normal">Cuidado para não rascunhar 15 rascunhos de negócios e não consolidar nenhum. O Caminho de Vida 8 exige a disciplina prática de Saturno para que as finanças sintonizem.</p>
                  </div>

                  {/* Opportunity */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between col-span-1 sm:col-span-2">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Oportunidade Principal do Mês</span>
                    <span className="text-xs font-black text-emerald-400 font-sans">Negócios Inteligentes & Mentoria de Conhecimento</span>
                    <p className="text-[9.5px] text-slate-405 mt-1 leading-normal">Sua matriz original brilha ao gerar novos métodos de ensino ou infoprodutos digitais. Não tenha medo de monetizar seu discernimento.</p>
                  </div>

                  {/* Dominant Energy */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Energia Dominante</span>
                    <span className="text-xs font-black text-pink-400 font-sans">Ar Ativo / Ideais Coletivos</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Força de Aquário vibrando na casa das grandes descobertas e alinhamento.</p>
                  </div>

                  {/* Avoid */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between col-span-1 sm:col-span-3">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">O que evitar este mês</span>
                    <span className="text-xs font-black text-orange-400 font-sans">Assinar contratos e debater nas redes sociais por impulsividade</span>
                    <p className="text-[9.5px] text-slate-405 mt-1 leading-normal">Aguarde transitar Mercúrio antes de fazer aportes financeiros robustos ou mandar mensagens reativas à noite das quais pode se arrepender.</p>
                  </div>

                  {/* Best Area for Focus */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between col-span-1 sm:col-span-3">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold mb-1">Melhor Área de Foco</span>
                    <span className="text-xs font-black text-indigo-400 font-sans">Estudos e Consolidamento Financeiro</span>
                    <p className="text-[9.5px] text-slate-405 mt-1 leading-normal">Direcione sua ressonância celular para consolidar sua carteira de investimentos e aprofundar seus estudos em astrologia sutil e inteligência.</p>
                  </div>

                  {/* Frase de poder */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-teal-500/20 col-span-1 sm:col-span-3 text-center">
                    <span className="text-[8px] font-mono text-teal-400 block uppercase tracking-wider font-bold mb-1">Frase de Poder de {personalProsperity.monthName}</span>
                    <p className="font-serif italic text-sm text-slate-200 py-1 font-semibold leading-relaxed">
                      "Eu canalizo a originalidade libertadora do Ar e a estrutura firme de Saturno para manifestar a abundância na matéria de forma sutil."
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CALENDÁRIO INTELIGENTE INTERATIVO */}
          {areaSubTab === 'calendario' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Calendário Interativo de Tendências (30 Dias)
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Selecione filtros de atividades para vibrar e fazer brilhar os dias indicativos do mês de {personalProsperity.monthName} de {personalProsperity.year}.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-[9px] font-mono font-bold text-sky-400 rounded-lg shrink-0">
                    {personalProsperity.monthName} {personalProsperity.year}
                  </span>
                </div>

                {/* Categories filtering list */}
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Filtros de Harmonização e Atividades:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {calendarCategories.map(cat => {
                      const isSelected = activeCalendarFilter === cat.id;
                      const IconCat = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCalendarFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border ${
                            isSelected 
                              ? 'bg-slate-800 border-sky-400 text-sky-305 font-black shadow-xs' 
                              : `bg-slate-950/40 border-slate-850 text-slate-400 ${cat.color} hover:border-slate-700`
                          }`}
                        >
                          <IconCat className="w-3 h-3" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* The 30 days grid */}
                <div className="space-y-3 pt-3">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-left">Grade de Datas (Clique em um dia para ler os detalhes):</span>
                  
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono">
                    {Array.from({ length: 30 }, (_, index) => {
                      const day = index + 1;
                      const isSelected = selectedCalendarDay === day;
                      const metadata = getCalendarDayIconAndBg(day);
                      
                      let glowingClass = "border-slate-850 bg-slate-950/50 text-slate-400";
                      if (isSelected) {
                        glowingClass = "bg-slate-800 border-sky-400 text-slate-100 shadow-md ring-1 ring-sky-450";
                      } else if (activeCalendarFilter !== 'todos' && metadata.isMatched) {
                        glowingClass = "border-sky-500/40 bg-sky-955/20 text-sky-300 ring-1 ring-sky-500/30 animate-pulse";
                      }

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedCalendarDay(day)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition h-14 cursor-pointer hover:border-slate-550 ${glowingClass}`}
                        >
                          <span className="text-[9px] font-bold text-slate-500 block leading-none">
                            {day.toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs pt-0.5 block">{metadata.sym || "☀️"}</span>
                          <span className="text-[7px] text-slate-500 font-sans block truncate max-w-full leading-none">
                            {metadata.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Click-to-read instructions output */}
                <div className="p-5 bg-slate-950/95 rounded-2xl border border-slate-800 text-left space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850 flex-wrap gap-2 leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-450 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase font-mono text-slate-100">
                        {selectedDayPrediction.dateFormatted}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono border ${selectedDayPrediction.tagColorClass}`}>
                      Vibração: {selectedDayPrediction.tagText}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    {/* Column 1 - Astrological Mechanics */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Influência Astrológica:</span>
                        <p className="text-slate-200 font-medium leading-relaxed">{selectedDayPrediction.astroInfluence}</p>
                      </div>

                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Aspectos Planetários do Dia:</span>
                        <p className="text-slate-300 italic font-mono text-[10.5px]">{selectedDayPrediction.aspects}</p>
                      </div>

                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Trânsito Celeste:</span>
                        <p className="text-sky-300 font-mono text-[10.5px]">{selectedDayPrediction.transit}</p>
                      </div>

                      <div className="flex items-center gap-4 p-2 bg-slate-900/50 rounded-xl border border-slate-850">
                        <div className="flex-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Energia Predominante</span>
                          <span className="text-[10px] font-bold text-slate-200">{selectedDayPrediction.predominantEnergy}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono text-slate-500 block">Nível Energético</span>
                          <span className="text-xs font-bold font-mono text-amber-400">{selectedDayPrediction.energyLevel}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 - Personal Guidance */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-[#16A340]/10 border border-[#16A340]/20 rounded-lg">
                          <strong className="text-[8px] font-mono text-emerald-400 uppercase block mb-0.5">Áreas Favorecidas:</strong>
                          <span className="text-slate-200 text-[10px] font-mono block">{selectedDayPrediction.favoredAreas.join(', ')}</span>
                        </div>
                        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                          <strong className="text-[8px] font-mono text-rose-400 uppercase block mb-0.5">Áreas de Atenção:</strong>
                          <span className="text-slate-200 text-[10px] font-mono block">{selectedDayPrediction.attentionAreas.join(', ')}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Oportunidades observadas:</span>
                        <p className="text-emerald-400 font-medium text-[11px]">{selectedDayPrediction.opportunities}</p>
                      </div>

                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Desafios projetados:</span>
                        <p className="text-rose-400 font-medium text-[11px]">{selectedDayPrediction.challenges}</p>
                      </div>

                      <div className="p-2.5 bg-indigo-950/20 rounded-xl border border-indigo-900/40">
                        <strong className="text-[8px] font-mono text-indigo-400 uppercase block mb-1">Conselho Estratégico:</strong>
                        <p className="text-indigo-200 text-[10.5px] leading-relaxed italic">{selectedDayPrediction.personalizedAdvice}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-900 text-xs text-left font-mono">
                    <div className="p-2 bg-slate-900/30 rounded-lg border border-slate-850">
                      <span className="text-[7.5px] text-slate-500 uppercase block">Cor Favorecida</span>
                      <span className="text-[10px] text-slate-350 font-bold block mt-0.5">{selectedDayPrediction.favorableColor}</span>
                    </div>
                    <div className="p-2 bg-slate-900/30 rounded-lg border border-slate-850">
                      <span className="text-[7.5px] text-slate-500 uppercase block">Número da Sorte</span>
                      <span className="text-[10px] text-slate-350 font-bold block mt-0.5">Nº {selectedDayPrediction.favorableNumber}</span>
                    </div>
                    <div className="p-2 bg-slate-900/30 rounded-lg border border-slate-850">
                      <span className="text-[7.5px] text-slate-500 block uppercase">Melhor Período</span>
                      <span className="text-[10px] text-indigo-300 font-bold block mt-0.5">{selectedDayPrediction.bestPeriod}</span>
                    </div>
                    <div className="p-2 bg-slate-900/30 rounded-lg border border-slate-850">
                      <span className="text-[7.5px] text-slate-500 block uppercase">Alerta de Período</span>
                      <span className="text-[10px] text-rose-400 font-bold block mt-0.5">{selectedDayPrediction.attentionPeriod}</span>
                    </div>
                  </div>

                  {/* Astro Map Custom message */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850/60 text-[10.5px] text-slate-400 font-sans leading-relaxed">
                    🌟 <strong className="text-slate-300">Mensagem do seu Mapa:</strong> {selectedDayPrediction.personalizedMessage}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: CORES FAVORÁVEIS */}
          {areaSubTab === 'cores' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Cores Favoráveis para o Mês de {personalProsperity.monthName}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Suas vibrações de pigmentos sintonizadas ao Sol de {zodiacSign} e à estabilidade do Caminho de Vida {lifePathNumber}.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-450 rounded-lg shrink-0">
                    Mensal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 font-sans text-left">
                  {[
                    { title: 'Cor Principal do Mês', name: 'Azul Cobalto Real', hex: '#1e3a8a', bgClass: 'bg-[#1e3a8a]', text: 'Ativa sua mente racional de Aquário, eliminando o estresse dos trânsitos.' },
                    { title: 'Cor de Transcendência', name: 'Violeta Estelar', hex: '#6366f1', bgClass: 'bg-[#6366f1]', text: 'Estimula recepções intuitivas nos sonhos e conecta os meridianos da mente.' },
                    { title: 'Cor para Prosperidade', name: 'Dourado Solar', hex: '#eab308', bgClass: 'bg-[#eab308]', text: 'Amplifica o magnetismo material do Caminho de Vida 8. Use na carteira ou contas.' },
                    { title: 'Cor para Afeto', name: 'Rosa Quartzo Sutil', hex: '#f43f5e', bgClass: 'bg-[#f43f5e]', text: 'Suaviza defesas lógicas em prol do acolhimento amoroso sincero.' },
                    { title: 'Cor para Trabalho', name: 'Cinza Slate Saturno', hex: '#334155', bgClass: 'bg-[#334155]', text: 'Fomenta disciplina diária para finalizar pendências e obrigações.' },
                    { title: 'Cor de Proteção', name: 'Off-White Pérola', hex: '#f8fafc', bgClass: 'bg-[#f8fafc]', text: 'Ideal para purificar vibrações densas em conversas ou ambientes pesados.' }
                  ].map((c, i) => (
                    <div key={i} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-850/70 space-y-3 hover:border-slate-800 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${c.bgClass} border border-white/10 shrink-0 shadow-lg`} />
                        <div>
                          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block leading-none">{c.title}</span>
                          <span className="text-[11px] font-bold text-slate-205 mt-1 block leading-tight">{c.name}</span>
                          <span className="text-[8px] font-mono text-slate-550 block mt-0.5">{c.hex.toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal italic">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AMULETOS E SÍMBOLOS */}
          {areaSubTab === 'amuletos' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-450" />
                      Amuletos & Símbolos de Proteção Pessoais
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Frequências físicas sólidas recomendadas para fixar e ancorar sua aura este mês.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-450 rounded-lg shrink-0">
                    Sintonizado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans text-left">
                  
                  {/* Elemento */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                    <div className="flex items-center gap-2 text-sky-400">
                      <Activity className="w-4 h-4 shrink-0 animate-pulse" />
                      <h4 className="text-[11px] font-bold uppercase font-mono tracking-wider text-sky-400">Seu Elemento Ativo: Ar</h4>
                    </div>
                    <p className="text-[10.5px] text-slate-350 leading-relaxed font-sans">
                      O Ar governa sua matriz de <strong>Aquário</strong>. Traz velocidade de raciocínio, intuição aberta e facilidade para propor soluções de negócios. Alinhe seu elemento acendendo sândalo logo pela manhã e abrindo as janelas do quarto.
                    </p>
                  </div>

                  {/* Crystals */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <h4 className="text-[11px] font-bold uppercase font-mono tracking-wider text-rose-400">Pedras de Filtro</h4>
                    </div>
                    <div className="text-[10.5px] text-slate-350 leading-relaxed font-sans space-y-1">
                      <p><strong>Lápis-Lazúli:</strong> Estimula intuição do cérebro superior e protege vias oníricas superiores.</p>
                      <p><strong>Selenita:</strong> Limpa poeiras de pensamentos reativos e dispersão acumulada.</p>
                    </div>
                  </div>

                  {/* Symbols */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Shield className="w-4 h-4 shrink-0" />
                      <h4 className="text-[11px] font-bold uppercase font-mono tracking-wider text-amber-400">Símbolos Ativos</h4>
                    </div>
                    <p className="text-[10.5px] text-slate-350 leading-relaxed font-sans">
                      O <strong>Heptagrama Sagrado (Estrela de Sete Pontas)</strong> soterra energias de fadiga celular e atua como escudo áurico nas terças-feiras de negócios arriscados.
                    </p>
                  </div>

                  {/* Amuletos */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Award className="w-4 h-4 shrink-0" />
                      <h4 className="text-[11px] font-bold uppercase font-mono tracking-wider text-purple-400">Amuletos Recomendados</h4>
                    </div>
                    <p className="text-[10.5px] text-slate-350 leading-relaxed font-sans">
                      Use um **Escarabeu de Lápis-Lazúli** posicionado na bolsa ou carteira de investimentos para guiar suas ações práticas rumo à consolidação do Caminho 8.
                    </p>
                  </div>
                </div>

                {/* Joias de poder recommendation */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850/85 text-left space-y-2.5 font-sans">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-900">
                    <Star className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <h4 className="text-[10px] font-bold uppercase font-mono text-amber-400 tracking-wider">Recomendação Estelar de Joia de Poder</h4>
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed">
                    Recomendamos o uso de um <strong>Colar de Lápis-Lazúli puro em Prata</strong> ou um <strong>Anel de Pirita ou Sodalita</strong> posicionado no dedo indicador para canalizar de forma sólida o magnetismo materializador do seu Caminho de Vida 8.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MENSAGEM DA SEMANA & CONSELHOS */}
          {areaSubTab === 'mensagem' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-pink-400" />
                      Conselhos & Mensagem da Semana
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Diretrizes canalizadas para governar suas decisões sintonizadas com o Solstício.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono font-bold text-pink-450 rounded-lg shrink-0">
                    Ativo Semana
                  </span>
                </div>

                {/* Bento Grid layout of explicit messages requested */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  
                  {/* Conselho principal */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <span className="text-[8px] font-mono text-slate-505 uppercase tracking-wider block font-bold">Conselho Principal</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      "Dê vazão rápida aos seus insights intelectuais e rascunhos. Acumular dezenas de planos na mente aérea sem dar passos de conclusão prática satura seu campo vital, gerando fadiga áurica."
                    </p>
                  </div>

                  {/* Alerta principal */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <span className="text-[8px] font-mono text-red-400 uppercase tracking-wider block font-bold">Alerta Principal</span>
                    <p className="text-xs text-slate-250 leading-relaxed">
                      "Cuidado com dispersões financeiras compensatórias na terça e na quarta-feira à noite. Trânsito lunar propício a gastos de impulso mental."
                    </p>
                  </div>

                  {/* Oportunidade principal */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Oportunidade Principal</span>
                    <p className="text-xs text-slate-250 leading-relaxed">
                      "Conversas ativas com velhas amizades de ideais aquarianos abrem conexões inesperadas para estruturar novas fontes de capital."
                    </p>
                  </div>

                  {/* Palavra de proteção */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1 flex flex-col justify-center text-center items-center">
                    <span className="text-[8px] font-mono text-amber-400 uppercase tracking-wider block font-bold mb-1">Palavra de Proteção</span>
                    <span className="text-lg font-black tracking-widest text-amber-450 block font-mono">"ÂNCORE-SE"</span>
                    <p className="text-[9.5px] text-slate-500 mt-1 leading-normal">Repita mentalmente ao acordar para banir distrações desordenadas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PROSPERIDADE */}
          {areaSubTab === 'prosperidade' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Prosperidade & Capital Financeiro
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">As emanações de abundância e fluxo de caixa sob a forte influência realizadora do seu Caminho de Vida {lifePathNumber}.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400 rounded-lg shrink-0">
                    Capital Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  
                  {/* Financial KPI Bento Column */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Melhor Dia Financeiro da Semana</span>
                        <span className="text-xs font-black text-emerald-400 block mt-1">
                          {personalProsperity.monthNumber % 2 === 0 ? "Quinta-Feira (Trânsito Júpiter)" : "Segunda-Feira (Trânsito Lunar favorável)"}
                        </span>
                      </div>
                      <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Melhores Dias Financeiros do Mês</span>
                        <span className="text-xs font-black text-amber-400 block mt-1">
                          {((personalProsperity.monthNumber * 2) % 28 + 1)} de {personalProsperity.monthName} & {((personalProsperity.monthNumber * 3) % 28 + 1)} de {personalProsperity.monthName}
                        </span>
                      </div>
                      <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Parâmetros Cromáticos da Riqueza</span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div 
                          className="w-6 h-6 rounded-full border border-white/10 shrink-0" 
                          style={{ backgroundColor: personalProsperity.favorableColor.hex }}
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Cor: {personalProsperity.favorableColor.name}</span>
                          <span className="text-[9px] font-mono text-slate-500">Número da Fortuna: {personalProsperity.monthNumber * 11}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial state and opportunities observed */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Energia do Dinheiro Hoje</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-extrabold rounded">
                          {75 + (personalProsperity.monthNumber * 4) % 25} / 100
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Oportunidades Financeiras Observadas:</span>
                        <ul className="space-y-2 text-[10px] text-slate-350 list-none font-sans">
                          {personalProsperity.opportunities.map((op, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{op}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 text-[9.5px] text-slate-400 italic leading-relaxed mt-4">
                      <strong>Conselho de abundância:</strong> {personalProsperity.strategicAdvice}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 10: AMOR */}
          {areaSubTab === 'amor' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-205 uppercase tracking-widest flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                      Amor & Romance
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vibrações afetivas, afinidades mútuas e caminhos para sintonizar a cumplicidade do coração.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono font-bold text-rose-405 rounded-lg shrink-0">
                    Amanhã
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  
                  {/* Romance schedule metrics */}
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Energia Amorosa da Semana</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-rose-455">78 / 100</span>
                        <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-rose-500" style={{ width: '78%' }} />
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal">Ambiente propício a sentimentos leves e trocas refinadas mediadas pelo intelecto.</p>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                      <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold border-b border-slate-900 pb-1">Melhores Dias para Afeto</span>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block">ENCONTROS</span>
                          <span className="font-bold text-slate-200">Sexta-Feira</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block">CONVERSAS ROMÂNTICAS</span>
                          <span className="font-bold text-slate-200">Quarta-Feira</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block">RECONCILIAÇÕES</span>
                          <span className="font-bold text-slate-200 font-sans">Sábado Tarde</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block">CONHECER PESSOAS</span>
                          <span className="font-bold text-slate-202">Terça-Feira</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points of attention */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[8px] font-mono text-red-400 block uppercase font-bold border-b border-slate-900 pb-1">Pontos de Atenção no Amor</span>
                      <ul className="space-y-2 text-[10px] text-slate-350 font-sans leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold shrink-0">!</span>
                          <span>"Evite racionalizar sentimentos instintivos em demasia. Seu par precisa de acolhimento físico e intimidade calorosa, não de debates e silogismos mecânicos."</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold shrink-0">!</span>
                          <span>"Em momentos de discussão, evite o sumiço silencioso ou distanciamento súbito de Aquário, pois isso expande sutilmente o senso de solidão nos afetos."</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 text-[9.5px] text-slate-400 italic mt-4">
                      <strong>Dica de conexão:</strong> Ofereça um chá de Camomila ou Capim-Limão morno antes de iniciar conversas de planos futuros para confortar os chakras do casal.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 11: RELACIONAMENTOS */}
          {areaSubTab === 'relacionamentos' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-405" />
                      Relacionamentos Sociais & Familiares
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">As emanações sociais da sua rede e quais condutas ativamente expandem sua vibração áurica na amizade.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-450 rounded-lg shrink-0">
                    Rede Ativa
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans text-xs">
                  
                  {/* Social energy */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Energia Social da Semana</span>
                      <span className="text-xs font-black text-cyan-400 block font-sans">Extrovertida & Harmônica (Elemento Ar ativo)</span>
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        Pessoas que podem agregar esta semana:
                      </span>
                      <p className="text-[10.5px] text-slate-350 leading-relaxed italic font-serif">
                        "Librianos trazem tempero estético e sensibilidade; Sagitarianos impulsionam sua mente teológica ou de negócios com visões de horizontes longínquos; nativos de Ar no geral sintonizam ideias em sinergia."
                      </p>
                    </div>
                  </div>

                  {/* Compliances & Conflitions behaviors requested */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-850/60 text-left">
                      <span className="text-[8px] font-mono text-emerald-400 block uppercase tracking-wider font-bold mb-1">Comportamentos que favorecem conexões:</span>
                      <ul className="space-y-1 text-[10px] text-slate-400 list-disc pl-4 font-sans">
                        <li>Praticar a escuta empática ativa antes de saltar para soluções mecânicas.</li>
                        <li>Propor conversas sobre planos futuros longínquos ou novos hobbies.</li>
                        <li>Cumprimentar mentorados sem pressa, oferecendo apoio moral despretensioso.</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-850/60 text-left">
                      <span className="text-[8px] font-mono text-red-400 block uppercase tracking-wider font-bold mb-1">Comportamentos que geram conflitos:</span>
                      <ul className="space-y-1 text-[10px] text-slate-400 list-disc pl-4 font-sans">
                        <li>Sarcasmo e friezas desproporcionais frente a sentimentos dos outros.</li>
                        <li>Manter a insistência rígida teimosa em debates intelectuais puramente abstratos.</li>
                        <li>Isolamento severo abrupto por vários dias sem justificar cansaços.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 11.5: SISTEMA SOCIAL E COMPATIBILIDADE */}
          {areaSubTab === 'compatibilidade_social' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center text-left">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      Sinergia & Ecossistema Social
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Explore afinidades, acompanhe a atividade no ecossistema e conecte-se com pessoas em ressonância estelar com seu mapa.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-450 rounded-lg shrink-0">
                    Sinergia Ativa
                  </span>
                </div>

                <SocialCompatibility 
                  userName={user.name} 
                  userSign={getZodiacSign(user.birthDate)} 
                  hasCreatedMap={!!user.hasCreatedMap} 
                />
              </div>
            </div>
          )}

          {/* TAB 12: DESENVOLVIMENTO PESSOAL */}
          {areaSubTab === 'desenvolvimento' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-205 uppercase tracking-widest flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-emerald-450 animate-pulse" />
                      Desenvolvimento Pessoal & Expansão
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">As lições, virtudes e hábitos sugeridos para curar bloqueios emocionais acumulados.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-450 rounded-lg shrink-0">
                    Autodesenvolvimento
                  </span>
                </div>

                {/* Bento Grid layouts of required parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  
                  {/* Core development pillars */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Habilidade Cósmica para desenvolver</span>
                      <span className="text-xs font-black text-slate-200 block mt-1">Inteligência Compassiva & Aterramento de Ideais</span>
                      <p className="text-[10px] text-slate-400 leading-normal">Aprender a desacelerar a ventania dos planos de Aquário e ancorá-los na matéria saturnina.</p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                      <span className="text-[8px] font-mono text-red-400 block uppercase font-bold">Bloqueio Emocional a Trabalhar</span>
                      <span className="text-xs font-black text-rose-400 block mt-1">Medo irracional da rejeição que gera isolamentos de orgulho</span>
                      <p className="text-[10px] text-slate-400 leading-normal">Vencer a resistência silenciosa a precisar confessar falhas ou vulnerabilidades a parceiros.</p>
                    </div>
                  </div>

                  {/* Virtues and main lessons */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1 mr-1">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Virtude da Semana</span>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-extrabold text-[8px] uppercase">Presença</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold leading-none">Lição da Semana:</span>
                        <p className="font-serif italic text-xs leading-relaxed text-slate-300">
                          "As conexões mais fortes e os negócios mais prósperos não florescem por pura inteligência racional, mas sim quando aceitamos abraçar nossa vulnerabilidade e resolver as pendências com paciência lúcida."
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-850 text-[10px] text-slate-405 italic mt-4">
                      <strong>Exercício Diário Recomendado:</strong> Reserve 10 minutos de manhã para respirar profundamente longe do celular, focando em pensamentos de gratidão sincera por três pessoas.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 13: CENTRO DE SONHOS (Dream metrics + automated SVG chart) */}
          {areaSubTab === 'sonhos' && (() => {
            const totalDreams = dreamsHistory.length;
            const latestDream = totalDreams > 0 ? dreamsHistory[0] : null;

            const dreamTitle = latestDream?.interpretation?.title || "Nenhum sonho sintonizado";
            const dreamSymbol = latestDream?.interpretation?.detectedAnimals?.[0]?.animal 
                                || latestDream?.interpretation?.detectedColors?.[0]?.color 
                                || (totalDreams > 0 ? "" + latestDream?.interpretation?.dreamEnergyType : "Sem símbolos");
            const dreamEmotion = latestDream?.interpretation?.predominantEmotion?.emotion || "Neutro";
            const dreamTendency = latestDream?.interpretation?.dreamEnergyType 
                                  ? `${latestDream?.interpretation?.dreamEnergyType} (${latestDream?.interpretation?.dreamEnergyIndex} Hz)`
                                  : "Nenhuma observada";

            // Chart generation based on real historical dream entries
            const graphDreams = [...dreamsHistory].slice(0, 6).reverse();
            const hasGraph = graphDreams.length > 0;
            const stepX = hasGraph ? (450 / Math.max(1, graphDreams.length - 1)) : 80;
            
            const pointsLucidity = graphDreams.map((d, i) => {
              const x = 25 + i * stepX;
              const pos = d?.interpretation?.positivityLevel || 3;
              const y = 95 - (pos / 5) * 75; // Map positivity up to 20 Y max
              return { x, y, date: d.date };
            });

            const pointsRecall = graphDreams.map((d, i) => {
              const x = 25 + i * stepX;
              const energy = d?.interpretation?.dreamEnergyIndex || 50;
              const y = 105 - (energy / 100) * 85; // Map energy up to 20 Y max
              return { x, y };
            });

            const pathLucidityD = pointsLucidity.length > 0 
              ? `M ${pointsLucidity[0].x} ${pointsLucidity[0].y} ` + pointsLucidity.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
              : "";

            const pathRecallD = pointsRecall.length > 0 
              ? `M ${pointsRecall[0].x} ${pointsRecall[0].y} ` + pointsRecall.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
              : "";

            return (
              <div className="space-y-6">
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                  <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold font-mono text-slate-205 uppercase tracking-widest flex items-center gap-1.5">
                        <Moon className="w-4 h-4 text-pink-400 animate-pulse" />
                        Métricas & Estatísticas do Centro de Sonhos
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Visão analítica de inteligência baseada nos registros arquivados no Cofre dos Sonhos.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono font-bold text-pink-450 rounded-lg shrink-0">
                      Relatório Onírico ({totalDreams} {totalDreams === 1 ? 'Sonho' : 'Sonhos'})
                    </span>
                  </div>

                  {totalDreams === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
                      <Moon className="w-10 h-10 text-pink-500/40 mx-auto animate-pulse" />
                      <h4 className="text-xs font-bold font-mono text-slate-350 uppercase">Sem histórico onírico cadastrado</h4>
                      <p className="text-[10.5px] text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
                        Sua mente subconsciente ainda aguarda a primeira sintonização. Vá até a aba superior <strong>Planeta</strong>, use a ferramenta <strong>Oráculo dos Sonhos</strong>, conte o que você andou sonhando e, à medida que a IA for interpretando seus sonhos, suas estatísticas e seu gráfico de evolução serão desenhados aqui automaticamente!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Dynamic calculated metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left font-sans animate-in fade-in duration-300">
                        
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between h-[90px]">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Sonho mais Recente</span>
                          <span className="text-[11px] font-bold text-slate-200 mt-1 block truncate" title={dreamTitle}>
                            {dreamTitle}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">Sintonizado em {latestDream?.date}</span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between h-[90px]">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Elemento em Destaque</span>
                          <span className="text-[11px] font-bold text-slate-200 mt-1 block truncate capitalize">
                            {dreamSymbol}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">Símbolo decodificado</span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between h-[90px]">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Emoção Predominante</span>
                          <span className="text-[11px] font-bold text-slate-200 mt-1 block truncate">
                            {dreamEmotion}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">Clima onírico sutil</span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between h-[90px]">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Tendência de Energia</span>
                          <span className="text-[11px] font-bold text-amber-100 mt-1 block truncate">
                            {dreamTendency}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">Frequência vibracional</span>
                        </div>
                      </div>

                      {/* Evolution of dreams custom SVG chart (requested: "Evolução dos sonhos ao longo dos meses") */}
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 text-left space-y-3 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 flex-wrap gap-2 leading-none">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">
                            Variação Energética Onírica (Suas Sintonizações Recentes)
                          </span>
                          <div className="flex items-center gap-3 text-[8.5px] font-mono">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                              <span className="text-slate-400">Positividade (1–5)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                              <span className="text-slate-400">Índice Energético (%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Custom animated responsive SVG area line graph */}
                        <div className="w-full h-44 relative bg-slate-900/20 rounded-xl border border-slate-900/60 p-2 overflow-hidden flex items-end">
                          <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none" referrerPolicy="no-referrer">
                            
                            {/* Grid lines */}
                            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(51, 65, 85, 0.2)" strokeDasharray="3,3" />
                            <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(51, 65, 85, 0.2)" strokeDasharray="3,3" />
                            <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(51, 65, 85, 0.2)" strokeDasharray="3,3" />

                            {/* Line 1: Positividade - Pink */}
                            {pathLucidityD && (
                              <path
                                d={pathLucidityD}
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="animate-pulse"
                              />
                            )}

                            {/* Line 2: Dream Recall - Indigo */}
                            {pathRecallD && (
                              <path
                                d={pathRecallD}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            )}

                            {/* Nodes */}
                            {pointsLucidity.map((p, idx) => (
                              <g key={`l-${idx}`}>
                                <circle cx={p.x} cy={p.y} r="3.5" fill="#f43f5e" stroke="#000" strokeWidth="1" />
                              </g>
                            ))}

                            {pointsRecall.map((p, idx) => (
                              <circle key={`r-${idx}`} cx={p.x} cy={p.y} r="3" fill="#6366f1" stroke="#000" strokeWidth="1" />
                            ))}

                            {/* Definitions */}
                            <defs>
                              <linearGradient id="grad_lucidity" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* X Axis Month Labels */}
                          <div className="absolute bottom-1 inset-x-0 flex justify-between px-6 text-[8px] font-mono text-slate-500">
                            {graphDreams.map((d, i) => (
                              <span key={d.id}>{d.date.slice(5)}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Real Dreaming Statistics and Archetypal Categories */}
                      {(() => {
                        const patterns = {
                          "Amor": 0,
                          "Família": 0,
                          "Trabalho": 0,
                          "Dinheiro": 0,
                          "Saúde": 0,
                          "Espiritualidade": 0,
                          "Medos": 0,
                          "Desejos": 0,
                          "Transformações": 0
                        };

                        const keywordsMap = {
                          "Amor": ["amor", "namor", "casar", "beijo", "paixão", "afeto", "atração", "coração"],
                          "Família": ["família", "mãe", "pai", "irmã", "irmão", "filho", "filha", "tios", "avô", "avó", "primo"],
                          "Trabalho": ["trabalho", "emprego", "cargo", "empresa", "carreira", "chefe", "colega", "reunião", "escritório"],
                          "Dinheiro": ["ouro", "dinheiro", "rico", "moeda", "dólar", "comprar", "pagar", "riqueza", "finança", "banco", "jóia"],
                          "Saúde": ["saúde", "doente", "médico", "cura", "hospital", "remédio", "corpo", "dor", "bem-estar", "gripe"],
                          "Espiritualidade": ["anjo", "estranho", "espírito", "revelação", "sagrado", "luz", "oráculo", "guia", "deus", "templo", "rezar"],
                          "Medos": ["medo", "correr", "fuga", "pesadelo", "monstro", "perigo", "cair", "perseguido", "escuro", "pânico"],
                          "Desejos": ["voar", "desejo", "sonho", "querer", "lindo", "festa", "viagem", "conquista", "comemorar", "espectáculo"],
                          "Transformações": ["cobra", "borboleta", "morte", "renascer", "mudar", "metamorfose", "transição", "portal", "fogo", "cinza"]
                        };

                        dreamsHistory.forEach(dream => {
                          const textToSearch = `${dream.description} ${dream.interpretation?.mainMeaning || ""} ${dream.interpretation?.title || ""}`.toLowerCase();
                          Object.entries(keywordsMap).forEach(([category, keywords]) => {
                            const matched = keywords.some(kw => textToSearch.includes(kw));
                            if (matched) {
                              patterns[category as keyof typeof patterns] += 1;
                            }
                          });
                        });

                        let lucidCount = 0;
                        let positiveCount = 0;
                        let nightmareCount = 0;

                        dreamsHistory.forEach(dream => {
                          const textToSearch = `${dream.description} ${dream.interpretation?.mainMeaning || ""}`.toLowerCase();
                          if (dream.interpretation?.dreamEnergyIndex >= 80 || textToSearch.includes("lúcido") || textToSearch.includes("lucido") || textToSearch.includes("consciente no sonho")) {
                            lucidCount++;
                          }
                          if (dream.interpretation?.positivityLevel >= 4.0) {
                            positiveCount++;
                          }
                          const emo = dream.interpretation?.predominantEmotion?.emotion?.toLowerCase() || '';
                          if (emo.includes("medo") || emo.includes("ansiedade") || textToSearch.includes("pesadelo") || textToSearch.includes("pânico") || textToSearch.includes("terror")) {
                            nightmareCount++;
                          }
                        });

                        const lucidPct = totalDreams > 0 ? Math.round((lucidCount / totalDreams) * 100) : 0;
                        const positivePct = totalDreams > 0 ? Math.round((positiveCount / totalDreams) * 100) : 0;
                        const nightmarePct = totalDreams > 0 ? Math.round((nightmareCount / totalDreams) * 100) : 0;

                        return (
                          <div className="space-y-5 pt-3 border-t border-slate-900">
                            
                            {/* Higher State frequencies */}
                            <div>
                              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 font-bold">
                                Frequências de Estado Subconsciente (Dados Reais)
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                                
                                {/* Lucidez */}
                                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-300">Frequência de Sonhos Lúcidos</span>
                                    <span className="text-[11px] font-mono font-black text-rose-450">{lucidPct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${lucidPct}%` }} />
                                  </div>
                                  <span className="text-[8.5px] text-slate-500 block">Registros conscientes ou com alta frequência energética.</span>
                                </div>

                                {/* Positividade */}
                                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-300">Frequência de Sonhos Positivos</span>
                                    <span className="text-[11px] font-mono font-black text-emerald-450">{positivePct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${positivePct}%` }} />
                                  </div>
                                  <span className="text-[8.5px] text-slate-500 block">Sonhos reveladores com elevado índice de positividade Cósmica.</span>
                                </div>

                                {/* Pesadelos */}
                                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-300">Incidentes de Pesadelos</span>
                                    <span className="text-[11px] font-mono font-black text-indigo-400">{nightmarePct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-505 h-full rounded-full transition-all duration-500" style={{ width: `${nightmarePct}%` }} />
                                  </div>
                                  <span className="text-[8.5px] text-slate-500 block">Frequência de manifestação de medos primitivos ou repouso sob tensão.</span>
                                </div>

                              </div>
                            </div>

                            {/* Archetypal Patterns */}
                            <div>
                              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 font-bold">
                                Reconhecimento de Padrões Reais de Inteligência Onírica
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(patterns).map(([category, count]) => {
                                  const pct = totalDreams > 0 ? Math.round((count / totalDreams) * 100) : 0;
                                  return (
                                    <div key={category} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col justify-between space-y-1.5">
                                      <div className="flex justify-between items-center text-[10px] font-sans">
                                        <span className="font-bold text-slate-300">{category}</span>
                                        <span className="font-mono text-slate-500">{count} {count === 1 ? 'evento' : 'eventos'} ({pct}%)</span>
                                      </div>
                                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-pink-500/80 h-full rounded-full transition-all duration-500 animate-pulse" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 14: ENERGIA DA CASA */}
          {areaSubTab === 'energia_casa' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-201 uppercase tracking-widest flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-indigo-400" />
                      Energia Cósmica da Casa & Harmonização
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dicas sintonizadas para equilibrar o seu ecossistema físico domiciliar e escritório com seu mapa.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono font-bold text-indigo-450 rounded-lg shrink-0">
                    Ambiente Físico
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left font-sans text-xs">
                  
                  {/* Aroma */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold mb-1">Melhor Aroma da Semana</span>
                    <span className="text-xs font-black text-slate-200">Capim-Limão Refrescante</span>
                    <p className="text-[9.5px] text-slate-400 leading-normal mt-1">Estimula os meridianos superiores do intelecto aquariano sem deixá-lo agitado.</p>
                  </div>

                  {/* Incense */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold mb-1">Melhor Incenso Sugerido</span>
                    <span className="text-xs font-black text-slate-200">Sândalo Puro ou Alecrim</span>
                    <p className="text-[9.5px] text-slate-400 leading-normal mt-1">Excelente para dissipar ondas eletromagnéticas estressantes do celular ou computador.</p>
                  </div>

                  {/* Plant */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold mb-1">Melhor Planta Recomendada</span>
                    <span className="text-xs font-black text-slate-200">Lírio da Paz ou Espada</span>
                    <p className="text-[9.5px] text-slate-400 leading-normal mt-1">Purifica os canais sutis do ar e ancora o fluxo realizador de Saturno (Caminho 8).</p>
                  </div>

                  {/* Best room corner */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-[100px]">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Melhor Ambiente da Casa</span>
                    <span className="text-xs font-black text-indigo-400 mt-1 block">Canto Leste (Nascer do Sol) de sua sala de estar</span>
                    <span className="text-[9.5px] text-slate-505 leading-normal">Ambiente ideal para alongamentos e leitura astrológica matinal rápida.</span>
                  </div>

                  {/* Bedroom color */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-[100px]">
                    <span className="text-[8px] font-mono text-purple-400 block uppercase font-bold">Cor recomendada no Quarto</span>
                    <span className="text-xs font-black text-purple-400 mt-1 block">Lilás Lavanda ou Violeta</span>
                    <span className="text-[9.5px] text-slate-505 leading-normal">Harmoniza o sono profundo e facilita o despertar da memória no Cofre de Sonhos.</span>
                  </div>

                  {/* Office color */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-[100px]">
                    <span className="text-[8px] font-mono text-sky-400 block uppercase font-bold">Cor recomendada no Escritório</span>
                    <span className="text-xs font-black text-sky-450 mt-1 block">Azul Índigo ou Verde Menta</span>
                    <span className="text-[9.5px] text-slate-505 leading-normal">Eleva a clareza analítica durante reuniões complexas e debates de metas corporativas.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MISSÕES DO PORTAL (Incorporating Missão da Semana) */}
          {areaSubTab === 'missao' && (
            <div className="space-y-6 text-left">
              
              {/* Part A: Daily Missions */}
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-850 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Missões Diárias Cósmicas
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cumpra os pequenos gestos do dia para consolidar o score celestial.</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-extrabold rounded-lg">
                    XP Acumulado: {scorePoints} pts
                  </span>
                </div>

                <div className="space-y-3">
                  {dailyMissions.map((task) => (
                    <div key={task.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850/60 flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDailyMission(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-[10px] cursor-pointer transition ${
                            task.isCompleted 
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' 
                              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                          }`}
                        >
                          {task.isCompleted && "✓"}
                        </button>
                        <div>
                          <h5 className={`text-xs font-bold text-slate-200 ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                          {task.benefit && (
                            <div className="mt-1.5 space-y-1">
                              <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[8.5px] font-mono text-purple-400 font-bold rounded inline-block">
                                ✨ {task.benefit}
                              </span>
                              {task.benefitExplanation && (
                                <p className="text-[9.5px] text-slate-500 italic block leading-normal pt-0.5">
                                  <strong>Benefício ao cumprir:</strong> {task.benefitExplanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-amber-500 font-bold shrink-0">+{task.points} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part B: Weekly Missions requested ("Missão da Semana") */}
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                    Missões da Semana (Retenção Ativa)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Principais metas desta semana para impulsionar conexões e estancar vazos de capital.</p>
                </div>

                <div className="space-y-3">
                  {weeklyMissions.map((task) => (
                    <div key={task.id} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-850/60 flex justify-between items-start gap-4 hover:border-slate-800 transition">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleWeeklyMission(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-[10px] cursor-pointer transition ${
                            task.isCompleted 
                              ? 'bg-purple-500 border-purple-400 text-slate-950 font-black' 
                              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                          }`}
                        >
                          {task.isCompleted && "✓"}
                        </button>
                        <div>
                          <h5 className={`text-xs font-black text-slate-200 ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                            "{task.title}"
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">{task.description}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-purple-400 font-bold shrink-0">+{task.points} XP</span>
                    </div>
                  ))}
                </div>

                {/* Claim reward block */}
                <div className="pt-3 flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex-wrap gap-3">
                  <span className="text-[9px] font-mono text-slate-400 max-w-[280px] leading-relaxed">
                    A conclusão semanal das missões estabiliza seu score material e clareia o Sol em Aquário.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Suas bênçãos e pontuações semanais foram integradas ao seu mapa de evolução pessoal!");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-950 text-[9.5px] font-black uppercase rounded-lg tracking-wider transition hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
                  >
                    Resgatar Recompensas Semanais
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
    </div>
  );
}
