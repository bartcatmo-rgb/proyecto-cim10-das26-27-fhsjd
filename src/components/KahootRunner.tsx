'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Question, ServiceArea, User } from '@/types';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  ArrowRight,
  Sliders,
  Volume2,
  VolumeX,
  ShieldAlert,
} from 'lucide-react';
import { useExamLockdown } from '@/lib/hooks/useExamLockdown';

interface Props {
  currentUser: User;
  initialDiscipline?: ServiceArea;
}

interface ParticipantScore {
  id: string;
  name: string;
  score: number;
  correctCount: number;
  streak: number;
  isCurrentUser: boolean;
  avatarBg: string;
}

export default function KahootRunner({ currentUser, initialDiscipline }: Props) {
  const router = useRouter();

  // Configuration Phase States
  const [phase, setPhase] = useState<'config' | 'playing' | 'question_review' | 'podium'>('config');
  const [discipline, setDiscipline] = useState<ServiceArea>(initialDiscipline || 'simulacro_integral');
  const [questionCount, setQuestionCount] = useState<number>(10); // Strictly 10 to 20
  const [timePerQuestion] = useState<number>(25); // 25s
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gameplay States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userCorrectCount, setUserCorrectCount] = useState(0);
  const [pointsGainedLast, setPointsGainedLast] = useState(0);

  // Classroom Live Competitors
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-Cheat & Web Anti-Capture Lockdown
  const { warningMessage, dismissWarning, blurCount } = useExamLockdown({
    enabled: phase === 'playing' || phase === 'question_review',
    examCode: `KAHOOT_${discipline}_COUNT_${questionCount}`,
  });

  // Audio effects synthesizer using Web Audio API
  const playSound = (type: 'correct' | 'wrong' | 'podium') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'podium') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Start Kahoot Round
  const handleStartRound = async () => {
    // Validate questionCount strictly between 10 and 20
    const safeCount = Math.max(10, Math.min(20, questionCount));

    try {
      const res = await fetch(`/api/kahoot/questions?discipline=${discipline}&count=${safeCount}`);
      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        alert(data.error || 'No se pudieron cargar preguntas para la ronda.');
        return;
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setCurrentScore(0);
      setStreak(0);
      setMaxStreak(0);
      setUserCorrectCount(0);
      setSelectedOption(null);

      // Generate competitive classroom peers for the live leaderboard
      const peers: ParticipantScore[] = [
        {
          id: currentUser.id,
          name: currentUser.fullName || currentUser.username,
          score: 0,
          correctCount: 0,
          streak: 0,
          isCurrentUser: true,
          avatarBg: 'bg-indigo-600',
        },
        { id: 'peer_1', name: 'Laura Gómez (DAS-A)', score: 0, correctCount: 0, streak: 0, isCurrentUser: false, avatarBg: 'bg-emerald-600' },
        { id: 'peer_2', name: 'Marcos Ruiz (DAS-B)', score: 0, correctCount: 0, streak: 0, isCurrentUser: false, avatarBg: 'bg-purple-600' },
        { id: 'peer_3', name: 'Elena Torres (DAS-A)', score: 0, correctCount: 0, streak: 0, isCurrentUser: false, avatarBg: 'bg-amber-600' },
        { id: 'peer_4', name: 'Javier Navarro (DAS-B)', score: 0, correctCount: 0, streak: 0, isCurrentUser: false, avatarBg: 'bg-rose-600' },
      ];
      setParticipants(peers);

      setTimeLeft(timePerQuestion);
      setPhase('playing');
    } catch {
      alert('Error al conectar con el servidor.');
    }
  };

  // Timer loop during question answering
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIndex]);

  const handleTimeExpire = () => {
    // If user didn't choose, count as failed
    if (selectedOption === null) {
      handleAnswer(null, 0);
    }
  };

  const handleSelect = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (selectedOption !== null || phase !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(optId);
    handleAnswer(optId, timeLeft);
  };

  const handleAnswer = (optId: 'A' | 'B' | 'C' | 'D' | null, remainingTime: number) => {
    const q = questions[currentIndex];
    const isCorrect = optId === q.correctOptionId;

    let pointsAwarded = 0;
    let newStreak = streak;

    if (isCorrect) {
      newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setUserCorrectCount((prev) => prev + 1);

      // Kahoot Formula: base 1000 * (0.5 + 0.5 * timeFraction) + streak bonus (100 * streak, max 500)
      const timeFraction = remainingTime / timePerQuestion;
      const basePoints = Math.round(500 + 500 * timeFraction);
      const streakBonus = Math.min(500, (newStreak - 1) * 100);
      pointsAwarded = basePoints + streakBonus;

      setCurrentScore((prev) => prev + pointsAwarded);
      playSound('correct');
    } else {
      setStreak(0);
      playSound('wrong');
    }

    setPointsGainedLast(pointsAwarded);

    // Update classroom peers dynamically with randomized score gains
    setParticipants((prev) => {
      return prev.map((p) => {
        if (p.isCurrentUser) {
          return {
            ...p,
            score: p.score + pointsAwarded,
            correctCount: isCorrect ? p.correctCount + 1 : p.correctCount,
            streak: isCorrect ? p.streak + 1 : 0,
          };
        }
        // Simulated classmates answering with 70% probability
        const peerCorrect = Math.random() < 0.72;
        const peerRemaining = Math.max(2, Math.floor(Math.random() * (timePerQuestion - 2)));
        const peerGain = peerCorrect ? Math.round(500 + 500 * (peerRemaining / timePerQuestion)) : 0;
        return {
          ...p,
          score: p.score + peerGain,
          correctCount: peerCorrect ? p.correctCount + 1 : p.correctCount,
          streak: peerCorrect ? p.streak + 1 : 0,
        };
      });
    });

    setPhase('question_review');
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(timePerQuestion);
      setPhase('playing');
    } else {
      handleFinishRound();
    }
  };

  const handleFinishRound = async () => {
    playSound('podium');

    // Sort final participants for ranking
    const finalSorted = [...participants].sort((a, b) => b.score - a.score);
    const userRank = finalSorted.findIndex((p) => p.isCurrentUser) + 1;

    setPhase('podium');

    // Save round result to SQLite
    try {
      await fetch('/api/kahoot/submit-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: `kround_${Date.now()}`,
          discipline,
          totalQuestions: questions.length,
          correctCount: userCorrectCount,
          totalScore: currentScore,
          streakMax: maxStreak,
          participants: finalSorted,
        }),
      });
    } catch {
      // ignore
    }
  };

  const currentQ = questions[currentIndex];

  // =========================================================================
  // 1. CONFIGURATION VIEW
  // =========================================================================
  if (phase === 'config') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-brand-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-amber-300 backdrop-blur">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>MODALIDAD COMPETITIVA EN DIRECTO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ronda de Codificación Tipo Kahoot
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
              Responde rápido a casos clínicos MEAP reales, acumula rachas de aciertos y compite por el podio de honor de la clase.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-15 pointer-events-none">
            <Trophy className="w-64 h-64 text-amber-400" />
          </div>
        </div>

        {/* Config Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Configuración de la Ronda (10 a 20 Preguntas)</span>
            </h2>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Specialty Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ámbito Asistencial / Especialidad
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as ServiceArea)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none"
            >
              {Object.entries(DISCIPLINE_CATALOG).map(([key, disc]) => (
                <option key={key} value={key}>
                  {disc.name} ({disc.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Question Count (Strictly 10 to 20) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Número de Preguntas de la Ronda
              </label>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 font-mono">
                {questionCount} preguntas
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="20"
              step="1"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Mínimo: 10 preguntas</span>
              <div className="flex gap-2">
                {[10, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuestionCount(preset)}
                    className={`px-2.5 py-0.5 rounded-md border text-xs font-bold transition-colors ${
                      questionCount === preset
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <span>Máximo: 20 preguntas</span>
            </div>
          </div>

          {/* Time notice */}
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Tiempo por pregunta: <strong>25 segundos</strong> con bonificación por velocidad</span>
            </div>
            <span className="font-bold text-purple-700">Podio 1º, 2º y 3º</span>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartRound}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>¡COMENZAR RONDA TIPO KAHOOT!</span>
          </button>
        </div>

      </div>
    );
  }

  // =========================================================================
  // 2. FINAL PODIUM VIEW (1º, 2º Y 3º PUESTO + RANKING)
  // =========================================================================
  if (phase === 'podium') {
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    const first = sortedParticipants[0];
    const second = sortedParticipants[1];
    const third = sortedParticipants[2];
    const rest = sortedParticipants.slice(3);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 select-none">
        
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-widest animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            ¡RONDA FINALIZADA! CLASIFICACIÓN OFICIAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Podio de Honor del Aula
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Resultados consolidados tras {questions.length} casos clínicos MEAP de alta velocidad.
          </p>
        </div>

        {/* 3D Visual Podium */}
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800">
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-8 pb-4">
            
            {/* 2ND PLACE (SILVER - LEFT) */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="relative">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${second.avatarBg} border-2 border-slate-300 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  🥈
                </div>
                {second.isCurrentUser && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white">
                    TÚ
                  </span>
                )}
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
                {second.name}
              </div>
              <div className="text-xs font-mono font-bold text-slate-300">
                {second.score.toLocaleString()} pts
              </div>
              {/* Podium Block 2 */}
              <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl h-36 sm:h-44 flex flex-col items-center justify-center border-t-4 border-slate-300 shadow-inner">
                <span className="text-4xl sm:text-5xl font-black text-white/90">2</span>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Plata</span>
              </div>
            </div>

            {/* 1ST PLACE (GOLD - CENTER - TALLEST) */}
            <div className="text-center space-y-2 flex flex-col items-center -translate-y-4">
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                  👑
                </div>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${first.avatarBg} border-4 border-amber-400 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/20`}>
                  🥇
                </div>
                {first.isCurrentUser && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow">
                    TÚ
                  </span>
                )}
              </div>
              <div className="font-black text-sm sm:text-base text-amber-300 truncate max-w-[120px] sm:max-w-[160px]">
                {first.name}
              </div>
              <div className="text-sm font-mono font-black text-amber-400">
                {first.score.toLocaleString()} pts
              </div>
              {/* Podium Block 1 */}
              <div className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-2xl h-48 sm:h-60 flex flex-col items-center justify-center border-t-4 border-amber-200 shadow-inner">
                <Trophy className="w-8 h-8 text-amber-950/40 mb-1" />
                <span className="text-5xl sm:text-6xl font-black text-amber-950">1</span>
                <span className="text-xs font-black text-amber-950 uppercase tracking-widest">Campeón</span>
              </div>
            </div>

            {/* 3RD PLACE (BRONZE - RIGHT) */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="relative">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${third.avatarBg} border-2 border-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  🥉
                </div>
                {third.isCurrentUser && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white">
                    TÚ
                  </span>
                )}
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
                {third.name}
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {third.score.toLocaleString()} pts
              </div>
              {/* Podium Block 3 */}
              <div className="w-full bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-2xl h-28 sm:h-36 flex flex-col items-center justify-center border-t-4 border-amber-600 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-amber-200">3</span>
                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Bronce</span>
              </div>
            </div>

          </div>

        </div>

        {/* Complete Ranking Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Tabla de Posiciones Finales de la Ronda</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Persistido en SQLite
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {sortedParticipants.map((p, idx) => (
              <div
                key={p.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  p.isCurrentUser ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}º
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm text-slate-900 font-bold block">
                      {p.name} {p.isCurrentUser && '(Tú)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {p.correctCount} aciertos de {questions.length}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-purple-700 block">
                    {p.score.toLocaleString()} pts
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {Math.round((p.correctCount / questions.length) * 100)}% acierto
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPhase('config')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Configurar y Jugar Otra Ronda</span>
          </button>

          <button
            onClick={() => router.push('/entrenamiento')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Volver a Entrenamientos MEAP
          </button>
        </div>

      </div>
    );
  }

  // =========================================================================
  // 3. GAMEPLAY & REVIEW INTERFACE
  // =========================================================================
  const timeProgressPercent = (timeLeft / timePerQuestion) * 100;
  const isAnswered = phase === 'question_review';

  // Kahoot Card Configurations (Red, Blue, Yellow, Green)
  const optionCardStyles = {
    A: {
      bg: 'bg-rose-500 hover:bg-rose-600 text-white',
      border: 'border-rose-600',
      symbol: '▲',
      label: 'Triángulo',
    },
    B: {
      bg: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'border-blue-700',
      symbol: '◆',
      label: 'Rombo',
    },
    C: {
      bg: 'bg-amber-500 hover:bg-amber-600 text-white',
      border: 'border-amber-600',
      symbol: '●',
      label: 'Círculo',
    },
    D: {
      bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'border-emerald-700',
      symbol: '■',
      label: 'Cuadrado',
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 select-none">
      {/* Integrity Warning Modal */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border-2 border-amber-500 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <h3 className="text-base font-black text-slate-900">Aviso de Integridad en Kahoot</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {warningMessage}
            </p>
            <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800">
              Incidencias registradas en esta ronda: <strong>{blurCount}</strong>.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={dismissWarning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Continuar ronda
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Game Bar: Question X of N, Timer, Score, Streak */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-black tracking-wider text-purple-300">
            PREGUNTA {currentIndex + 1} DE {questions.length}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {DISCIPLINE_CATALOG[currentQ.discipline]?.name || currentQ.discipline}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak Indicator */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl animate-pulse">
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>Racha x{streak}</span>
            </div>
          )}

          {/* Current Score Counter */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Puntos</span>
            <span className="text-base sm:text-lg font-mono font-black text-amber-300">
              {currentScore.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Countdown Timer Bar */}
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${timeProgressPercent}%` }}
        />
      </div>

      {/* Clinical Scenario Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            Nivel {currentQ.level} · {currentQ.serviceContext}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {currentQ.caseTitle}
        </h2>

        <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          {currentQ.clinicalScenario}
        </p>

        <p className="text-xs font-black uppercase tracking-wider text-slate-500 pt-1">
          ¿Cuál es la codificación principal exacta o secuencia correcta?:
        </p>
      </div>

      {/* 4 KAHOOT COLORED BUTTONS (GRID 2x2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((opt) => {
          const cfg = optionCardStyles[opt.id];
          const isSelected = selectedOption === opt.id;
          const isCorrect = opt.id === currentQ.correctOptionId;

          let buttonStyle = `${cfg.bg} ${cfg.border} shadow-md`;
          if (isAnswered) {
            if (isCorrect) {
              buttonStyle = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-300 shadow-lg';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'bg-rose-600 border-rose-400 text-white ring-4 ring-rose-300 opacity-90';
            } else {
              buttonStyle = 'bg-slate-300 border-slate-400 text-slate-600 opacity-40';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id as any)}
              disabled={isAnswered}
              className={`min-h-[110px] p-5 rounded-2xl border-b-4 text-left transition-all transform active:scale-95 flex items-start gap-4 ${buttonStyle}`}
            >
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center font-black text-lg flex-shrink-0">
                {cfg.symbol}
              </div>

              <div className="flex-1 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-black/25 font-mono text-xs font-black">
                  {opt.code}
                </span>
                <p className="text-xs sm:text-sm font-semibold leading-snug">
                  {opt.text}
                </p>
              </div>

              {isAnswered && isCorrect && (
                <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6 text-white flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post-Answer Feedback & Next Button */}
      {isAnswered && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-md space-y-4 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              {selectedOption === currentQ.correctOptionId ? (
                <div className="flex items-center gap-2 text-emerald-700 font-black text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>¡CORRECTO! +{pointsGainedLast} PUNTOS</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-700 font-black text-base">
                  <XCircle className="w-6 h-6 text-rose-600" />
                  <span>¡RESPUESTA INCORRECTA! (+0 pts)</span>
                </div>
              )}
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-md transition-colors flex items-center gap-2 ml-auto"
            >
              <span>{currentIndex + 1 < questions.length ? 'Siguiente Pregunta' : 'Ver Podio Final'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Reasoned Explanation */}
          <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <strong className="text-slate-900 block font-bold">Justificación Oficial CIM-10:</strong>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                {currentQ.reasonedResolution.clinicalAnalysis}
              </p>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Ruta: {currentQ.reasonedResolution.cim10Path}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
