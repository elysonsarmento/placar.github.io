/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings as SettingsIcon, RotateCcw, Plus, Minus, X, Check, ChevronRight, ChevronLeft, 
  ArrowLeftRight, Info, RefreshCw, Trash2, Play, Pause, Users, Trophy, Gamepad2, 
  Monitor, Clock, History, Bell, Eye, EyeOff, Layers, ShieldCheck, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Team, MatchState, TournamentMatch, DEFAULT_TEAMS } from './types';
import { APP_VERSION, CHANGELOG } from './changelog';

export default function App() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const checkForUpdates = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          // The update check is complete. If there's an update, needRefresh will become true.
          alert('Verificação concluída. Se houver atualização, o botão de atualizar aparecerá.');
        });
      });
    } else {
      alert('Service Worker não suportado neste navegador.');
    }
  };

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('placar_teams');
    return saved ? JSON.parse(saved) : DEFAULT_TEAMS;
  });

  const [match, setMatch] = useState<MatchState>(() => {
    const saved = localStorage.getItem('placar_match');
    const defaultMatch: MatchState = {
      team1Id: '1',
      team2Id: '2',
      team1Score: 0,
      team2Score: 0,
      team1Sets: 0,
      team2Sets: 0,
      maxSets: 3,
      pointsToWinSet: 25,
      setHistory: [],
      pointHistory: [],
      useSets: true,
      displayTeamNames: false,
      sidesSwapped: false,
      showSwapButton: true,
      showWinnerOverlay: true,
      keepScreenAwake: false,
      stopAtSetPoint: false,
      useAdvantage: true,
      useTimer: false,
      timerMode: 'progressive',
      timerDuration: 0,
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultMatch,
          ...parsed,
          // Ensure arrays are initialized if missing in old storage
          setHistory: parsed.setHistory || [],
          pointHistory: parsed.pointHistory || [],
          useSets: parsed.useSets !== undefined ? parsed.useSets : true,
          displayTeamNames: parsed.displayTeamNames !== undefined ? parsed.displayTeamNames : false,
          sidesSwapped: parsed.sidesSwapped || false,
          showSwapButton: parsed.showSwapButton !== undefined ? parsed.showSwapButton : true,
          showWinnerOverlay: parsed.showWinnerOverlay !== undefined ? parsed.showWinnerOverlay : true,
          keepScreenAwake: parsed.keepScreenAwake || false,
          stopAtSetPoint: parsed.stopAtSetPoint || false,
          useAdvantage: parsed.useAdvantage !== undefined ? parsed.useAdvantage : true,
          useTimer: parsed.useTimer || false,
          timerMode: parsed.timerMode || 'progressive',
          timerDuration: parsed.timerDuration !== undefined ? parsed.timerDuration : 0,
        };
      } catch (e) {
        return defaultMatch;
      }
    }
    return defaultMatch;
  });

  const [tournamentHistory, setTournamentHistory] = useState<TournamentMatch[]>(() => {
    const saved = localStorage.getItem('placar_tournament_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('placar_tournament_history', JSON.stringify(tournamentHistory));
  }, [tournamentHistory]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const isProcessingSetRef = useRef(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [settingsTab, setSettingsTab] = useState<'match' | 'teams' | 'rules' | 'history' | 'system'>('match');

  const [timerValue, setTimerValue] = useState(() => match.timerMode === 'regressive' ? match.timerDuration * 60 : 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    setTimerValue(match.timerMode === 'regressive' ? match.timerDuration * 60 : 0);
    setIsTimerRunning(false);
  }, [match.timerDuration, match.timerMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerValue(prev => {
          if (match.timerMode === 'regressive') {
            if (prev <= 1) {
              setIsTimerRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, match.timerMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const lastSeen = localStorage.getItem('placar_last_version');
    if (lastSeen !== APP_VERSION) {
      setIsChangelogOpen(true);
      localStorage.setItem('placar_last_version', APP_VERSION);
    }
  }, []);

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (match.keepScreenAwake && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error('Wake Lock error:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current !== null) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.error('Wake Lock release error:', err);
        }
      }
    };

    if (match.keepScreenAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && match.keepScreenAwake) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [match.keepScreenAwake]);

  useEffect(() => {
    localStorage.setItem('placar_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('placar_match', JSON.stringify(match));
  }, [match]);

  const updateScore = useCallback((teamNum: 1 | 2, delta: number) => {
    setMatch((prev: MatchState) => {
      const scoreKey = teamNum === 1 ? 'team1Score' : 'team2Score';
      
      // Stop at set point logic
      if (delta > 0 && prev.stopAtSetPoint) {
        const t1Wins = prev.team1Score >= prev.pointsToWinSet && (!prev.useAdvantage || prev.team1Score >= prev.team2Score + 2);
        const t2Wins = prev.team2Score >= prev.pointsToWinSet && (!prev.useAdvantage || prev.team2Score >= prev.team1Score + 2);
        if (t1Wins || t2Wins) return prev;
      }

      const newScore = Math.max(0, prev[scoreKey] + delta);
      
      // Update point history
      let newPointHistory = [...(prev.pointHistory || [])];
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          newPointHistory.push(teamNum);
        }
      } else if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i++) {
          const lastIndex = newPointHistory.lastIndexOf(teamNum);
          if (lastIndex !== -1) {
            newPointHistory.splice(lastIndex, 1);
          }
        }
      }

      return { 
        ...prev, 
        [scoreKey]: newScore, 
        pointHistory: newPointHistory
      };
    });
  }, []);

  const updateSets = useCallback((teamNum: 1 | 2, delta: number) => {
    setMatch((prev: MatchState) => {
      const setKey = teamNum === 1 ? 'team1Sets' : 'team2Sets';
      const newSets = Math.max(0, Math.min(prev.maxSets, prev[setKey] + delta));
      return { ...prev, [setKey]: newSets };
    });
  }, []);

  const nextSet = useCallback((winner: 1 | 2) => {
    if (isProcessingSetRef.current) return;
    isProcessingSetRef.current = true;

    setMatch((prev: MatchState) => ({
      ...prev,
      setHistory: [...prev.setHistory, { team1: prev.team1Score, team2: prev.team2Score }],
      team1Score: 0,
      team2Score: 0,
      team1Sets: winner === 1 ? prev.team1Sets + 1 : prev.team1Sets,
      team2Sets: winner === 2 ? prev.team2Sets + 1 : prev.team2Sets,
      pointHistory: [],
    }));

    // Reset processing state after a short delay to prevent double-clicks
    setTimeout(() => {
      isProcessingSetRef.current = false;
    }, 500);
  }, []);

  const resetMatch = useCallback((force = false) => {
    const performReset = () => {
      // Save current match to history if there's any score BEFORE resetting
      if (match.team1Score > 0 || match.team2Score > 0 || match.team1Sets > 0 || match.team2Sets > 0) {
        const finalSetHistory = (match.team1Score > 0 || match.team2Score > 0) 
          ? [...match.setHistory, { team1: match.team1Score, team2: match.team2Score }]
          : match.setHistory;

        setTournamentHistory((th: TournamentMatch[]) => [...th, {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          team1: { id: match.team1Id, score: match.team1Score, sets: match.team1Sets },
          team2: { id: match.team2Id, score: match.team2Score, sets: match.team2Sets },
          setHistory: finalSetHistory
        }]);
      }

      // Then reset the match
      setMatch((prev: MatchState) => ({
        ...prev,
        team1Score: 0,
        team2Score: 0,
        team1Sets: 0,
        team2Sets: 0,
        setHistory: [],
        pointHistory: [],
      }));
    };

    if (force) {
      performReset();
    } else {
      performReset();
    }
  }, [match]);

  const handleTeamChange = useCallback((teamIndex: 1 | 2, newTeamId: string) => {
    // Save current match to history if there's any score BEFORE changing teams
    if (match.team1Score > 0 || match.team2Score > 0 || match.team1Sets > 0 || match.team2Sets > 0) {
      const finalSetHistory = (match.team1Score > 0 || match.team2Score > 0) 
        ? [...match.setHistory, { team1: match.team1Score, team2: match.team2Score }]
        : match.setHistory;

      setTournamentHistory((th: TournamentMatch[]) => [...th, {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        team1: { id: match.team1Id, score: match.team1Score, sets: match.team1Sets },
        team2: { id: match.team2Id, score: match.team2Score, sets: match.team2Sets },
        setHistory: finalSetHistory
      }]);
    }
    
    // Then reset and apply the new team
    setMatch((prev: MatchState) => ({
      ...prev,
      [teamIndex === 1 ? 'team1Id' : 'team2Id']: newTeamId,
      team1Score: 0,
      team2Score: 0,
      team1Sets: 0,
      team2Sets: 0,
      setHistory: [],
      pointHistory: [],
    }));
  }, [match]);

  const team1 = teams.find(t => t.id === match.team1Id) || teams[0];
  const team2 = teams.find(t => t.id === match.team2Id) || teams[1];

  const team1WinsSet = match.team1Score >= match.pointsToWinSet && (!match.useAdvantage || match.team1Score >= match.team2Score + 2);
  const team2WinsSet = match.team2Score >= match.pointsToWinSet && (!match.useAdvantage || match.team2Score >= match.team1Score + 2);

  const setsToWin = Math.ceil(match.maxSets / 2);
  const matchWinner = match.useSets 
    ? (match.team1Sets >= setsToWin ? 1 : match.team2Sets >= setsToWin ? 2 : null) 
    : (team1WinsSet ? 1 : team2WinsSet ? 2 : null);

  const showTeam1CloseBtn = team1WinsSet && (match.useSets ? !matchWinner : !match.showWinnerOverlay);
  const showTeam2CloseBtn = team2WinsSet && (match.useSets ? !matchWinner : !match.showWinnerOverlay);

  return (
    <div className="fixed top-0 left-0 w-[100vw] h-[100vh] text-white font-sans overflow-hidden select-none bg-black">
      {/* Top Center Displays (Sets & Timer) */}
      <div className="absolute top-[env(safe-area-inset-top)] left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-30 p-4 pt-10 w-full max-w-2xl">
        {match.useSets && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white px-6 py-3 rounded-2xl border-2 border-black/5 text-4xl font-black tabular-nums min-w-[85px] text-center shadow-2xl"
            style={{ color: match.sidesSwapped ? team2.color : team1.color }}
          >
            {match.sidesSwapped ? match.team2Sets : match.team1Sets}
          </motion.div>
        )}

        {/* Timer Display */}
        {match.useTimer && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-2xl font-black tabular-nums text-center shadow-xl cursor-pointer hover:bg-black/80 transition-colors flex items-center gap-3"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 shrink-0">
              {isTimerRunning ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white ml-1" />}
            </div>
            <span className={match.timerMode === 'regressive' && timerValue <= 60 ? 'text-red-400' : 'text-white'}>
              {formatTime(timerValue)}
            </span>
            <button 
              className="p-2 hover:bg-white/20 rounded-full transition-colors shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setTimerValue(match.timerMode === 'regressive' ? match.timerDuration * 60 : 0);
                setIsTimerRunning(false);
              }}
              title="Zerar Cronômetro"
            >
              <RotateCcw size={16} />
            </button>
          </motion.div>
        )}

        {match.useSets && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white px-6 py-3 rounded-2xl border-2 border-black/5 text-4xl font-black tabular-nums min-w-[85px] text-center shadow-2xl"
            style={{ color: match.sidesSwapped ? team1.color : team2.color }}
          >
            {match.sidesSwapped ? match.team1Sets : match.team2Sets}
          </motion.div>
        )}
      </div>

      {/* Main Scoreboard */}
      <div className={`flex h-full w-full ${match.sidesSwapped ? 'flex-col-reverse landscape:flex-row-reverse' : 'flex-col landscape:flex-row'}`}>
        {/* Team 1 Area */}
        <div 
          className="relative flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center cursor-pointer active:opacity-95 transition-all pt-28 pb-12 landscape:pt-[env(safe-area-inset-top)] landscape:pb-[env(safe-area-inset-bottom)]"
          style={{ backgroundColor: team1.color }}
          onClick={() => !matchWinner && updateScore(1, 1)}
        >
          {match.displayTeamNames && (
            <div className="absolute top-[calc(4rem+env(safe-area-inset-top))] text-4xl font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md z-10">
              {team1.name}
            </div>
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              key={match.team1Score}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`font-black leading-none tabular-nums drop-shadow-2xl transition-all duration-300 ${match.team1Score >= 100 ? 'text-[6rem] landscape:text-[14rem]' : match.team1Score >= 10 ? 'text-[10rem] landscape:text-[20rem]' : 'text-[12rem] landscape:text-[32rem]'}`}
            >
              {match.team1Score}
            </motion.div>
          </div>

          {/* Next Set Button Overlay */}
          <AnimatePresence>
            {showTeam1CloseBtn && (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute top-1/2 -translate-y-1/2 bg-white text-black px-12 py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  if (match.useSets) nextSet(1);
                  else resetMatch(true);
                }}
              >
                FECHAR SET
              </motion.button>
            )}
          </AnimatePresence>

          {/* Decrement Button */}
          <button 
            className={`absolute bottom-4 landscape:bottom-[calc(6rem+env(safe-area-inset-bottom))] ${match.sidesSwapped ? 'right-4 landscape:right-8' : 'left-4 landscape:left-8'} p-4 landscape:p-6 bg-black/20 rounded-full hover:bg-black/40 transition-colors border border-white/5 z-20 active:scale-90`}
            onClick={(e) => {
              e.stopPropagation();
              updateScore(1, -1);
            }}
          >
            <Minus className="w-8 h-8 landscape:w-12 landscape:h-12 text-white" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-1 w-full landscape:w-1 landscape:h-full bg-black/30 z-10" />

        {/* Team 2 Area */}
        <div 
          className="relative flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center cursor-pointer active:opacity-95 transition-all pt-12 pb-36 landscape:pt-[env(safe-area-inset-top)] landscape:pb-[env(safe-area-inset-bottom)]"
          style={{ backgroundColor: team2.color }}
          onClick={() => !matchWinner && updateScore(2, 1)}
        >
          {match.displayTeamNames && (
            <div className="absolute top-[calc(4rem+env(safe-area-inset-top))] text-4xl font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md z-10">
              {team2.name}
            </div>
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              key={match.team2Score}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`font-black leading-none tabular-nums drop-shadow-2xl transition-all duration-300 ${match.team2Score >= 100 ? 'text-[6rem] landscape:text-[14rem]' : match.team2Score >= 10 ? 'text-[10rem] landscape:text-[20rem]' : 'text-[12rem] landscape:text-[32rem]'}`}
            >
              {match.team2Score}
            </motion.div>
          </div>

          {/* Next Set Button Overlay */}
          <AnimatePresence>
            {showTeam2CloseBtn && (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute top-1/2 -translate-y-1/2 bg-white text-black px-12 py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  if (match.useSets) nextSet(2);
                  else resetMatch(true);
                }}
              >
                FECHAR SET
              </motion.button>
            )}
          </AnimatePresence>

          {/* Decrement Button */}
          <button 
            className={`absolute bottom-4 landscape:bottom-[calc(6rem+env(safe-area-inset-bottom))] ${match.sidesSwapped ? 'left-4 landscape:left-8' : 'right-4 landscape:right-8'} p-4 landscape:p-6 bg-black/20 rounded-full hover:bg-black/40 transition-colors border border-white/5 z-20 active:scale-90`}
            onClick={(e) => {
              e.stopPropagation();
              updateScore(2, -1);
            }}
          >
            <Minus className="w-8 h-8 landscape:w-12 landscape:h-12 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Displays (Timeline & History) */}
      <div className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 w-full max-w-[90vw]">
        {/* Point Timeline */}
        {match.pointHistory && match.pointHistory.length > 0 && (
          <div className="flex gap-2 overflow-x-auto custom-scrollbar px-5 py-3 items-center bg-zinc-900/90 rounded-full backdrop-blur-md border border-white/20 shadow-2xl max-w-full">
            {match.pointHistory.map((teamNum, idx) => {
              const teamColor = teamNum === 1 ? team1.color : team2.color;
              return (
                <div 
                  key={idx}
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm border-2 border-white/90"
                  style={{ backgroundColor: teamColor }}
                  title={`Ponto ${idx + 1}`}
                />
              );
            })}
          </div>
        )}

        {/* Bottom History Display */}
        {match.useSets && match.setHistory && match.setHistory.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-full max-w-xs px-2">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Sets da Partida Atual
               </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 px-4 max-w-full">
                {(match.setHistory || []).map((set, i) => (
                  <div key={i} className="bg-white px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center min-w-[80px] shadow-xl shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Set {i + 1}</span>
                    <div className={`flex gap-2 font-bold text-lg ${match.sidesSwapped ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span style={{ color: team1.color }}>{set.team1}</span>
                      <span className="text-zinc-200">|</span>
                      <span style={{ color: team2.color }}>{set.team2}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {matchWinner && match.showWinnerOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold uppercase tracking-[0.5em] text-zinc-400">Vencedor da Partida</h2>
              <div className="text-8xl font-black uppercase tracking-tighter" style={{ color: matchWinner === 1 ? team1.color : team2.color }}>
                {matchWinner === 1 ? team1.name : team2.name}
              </div>
              <div className="text-2xl font-medium text-zinc-500">
                Placar Final: {match.sidesSwapped ? match.team2Sets : match.team1Sets} - {match.sidesSwapped ? match.team1Sets : match.team2Sets}
              </div>
              <button 
                onClick={() => resetMatch(true)}
                className="mt-12 px-12 py-6 bg-white text-black rounded-full font-black text-2xl hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              >
                NOVA PARTIDA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Controls */}
      {!(matchWinner && match.showWinnerOverlay) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row landscape:flex-col gap-4 landscape:gap-6 z-40">
          {match.showSwapButton && (
            <button 
              className="p-5 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-2xl active:scale-90"
              onClick={() => setMatch(prev => ({ ...prev, sidesSwapped: !prev.sidesSwapped }))}
              title="Trocar Lados"
            >
              <ArrowLeftRight size={36} />
            </button>
          )}
          <button 
            className="p-5 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-2xl active:scale-90"
            onClick={() => setShowResetConfirm(true)}
            title="Zerar placar"
          >
            <RotateCcw size={36} />
          </button>
          <button 
            className="p-5 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-2xl active:scale-90"
            onClick={() => setIsSettingsOpen(true)}
            title="Configurações"
          >
            <SettingsIcon size={36} />
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-8"
          >
            <div className="bg-zinc-900 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] relative">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-800/30 backdrop-blur-md z-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-600/20 text-blue-400 rounded-2xl shadow-inner">
                    <SettingsIcon size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">Configurações</h2>
                    <p className="text-zinc-500 text-sm font-medium">Personalize sua experiência no Placar Pro</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-4 hover:bg-white/10 rounded-full transition-all hover:rotate-90 text-zinc-400 hover:text-white"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-80 border-r border-white/10 bg-zinc-900/50 p-8 flex flex-col gap-3">
                  <button 
                    onClick={() => setSettingsTab('match')}
                    className={`flex items-center gap-4 w-full p-5 rounded-2xl transition-all group ${settingsTab === 'match' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                  >
                    <Trophy size={24} className={settingsTab === 'match' ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    <span className="font-bold text-lg">Partida</span>
                  </button>
                  <button 
                    onClick={() => setSettingsTab('teams')}
                    className={`flex items-center gap-4 w-full p-5 rounded-2xl transition-all group ${settingsTab === 'teams' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                  >
                    <Users size={24} className={settingsTab === 'teams' ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    <span className="font-bold text-lg">Times</span>
                  </button>
                  <button 
                    onClick={() => setSettingsTab('rules')}
                    className={`flex items-center gap-4 w-full p-5 rounded-2xl transition-all group ${settingsTab === 'rules' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                  >
                    <ShieldCheck size={24} className={settingsTab === 'rules' ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    <span className="font-bold text-lg">Regras</span>
                  </button>
                  <button 
                    onClick={() => setSettingsTab('history')}
                    className={`flex items-center gap-4 w-full p-5 rounded-2xl transition-all group ${settingsTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                  >
                    <History size={24} className={settingsTab === 'history' ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    <span className="font-bold text-lg">Histórico</span>
                  </button>
                  <button 
                    onClick={() => setSettingsTab('system')}
                    className={`flex items-center gap-4 w-full p-5 rounded-2xl transition-all group ${settingsTab === 'system' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                  >
                    <Monitor size={24} className={settingsTab === 'system' ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    <span className="font-bold text-lg">Sistema</span>
                  </button>

                  <div className="mt-auto pt-8 border-t border-white/5">
                    <div className="p-6 bg-zinc-800/30 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status do Sistema</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                        Versão {APP_VERSION} estável e pronta para uso.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-zinc-900/30">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={settingsTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-3xl mx-auto space-y-12"
                    >
                      {settingsTab === 'match' && (
                        <div className="space-y-10">
                          <header>
                            <h3 className="text-3xl font-black text-white mb-2">Configuração da Partida</h3>
                            <p className="text-zinc-500">Defina os times e a estrutura da partida atual</p>
                          </header>

                          <div className="grid grid-cols-1 gap-8">
                            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-6">
                              <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Time Esquerda</label>
                                <div className="relative group">
                                  <select 
                                    className="w-full bg-zinc-800 border-2 border-white/5 rounded-3xl p-6 text-xl font-bold appearance-none focus:border-blue-500 outline-none transition-all cursor-pointer pr-12"
                                    value={match.team1Id}
                                    onChange={(e) => handleTeamChange(1, e.target.value)}
                                  >
                                    {teams.map(t => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                  </select>
                                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-blue-400 transition-colors rotate-90" size={24} />
                                </div>
                              </div>

                              <div className="pt-8">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 shadow-inner">
                                  <span className="text-[10px] font-black text-zinc-600">VS</span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Time Direita</label>
                                <div className="relative group">
                                  <select 
                                    className="w-full bg-zinc-800 border-2 border-white/5 rounded-3xl p-6 text-xl font-bold appearance-none focus:border-blue-500 outline-none transition-all cursor-pointer pr-12"
                                    value={match.team2Id}
                                    onChange={(e) => handleTeamChange(2, e.target.value)}
                                  >
                                    {teams.map(t => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                  </select>
                                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-blue-400 transition-colors rotate-90" size={24} />
                                </div>
                              </div>
                            </div>

                            <div className="p-8 bg-zinc-800/50 rounded-[2.5rem] border border-white/5 space-y-8">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl">
                                  <Gamepad2 size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-white">Estrutura do Jogo</h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Modo de Jogo</label>
                                  <div className="flex bg-zinc-900 rounded-2xl p-1.5 border border-white/5">
                                    <button 
                                      onClick={() => setMatch(prev => ({ ...prev, useSets: true }))}
                                      className={`flex-1 py-4 rounded-xl font-black transition-all text-sm ${match.useSets ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                      Por Sets
                                    </button>
                                    <button 
                                      onClick={() => setMatch(prev => ({ ...prev, useSets: false }))}
                                      className={`flex-1 py-4 rounded-xl font-black transition-all text-sm ${!match.useSets ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                      Apenas Pontos
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{match.useSets ? 'Pontos por Set' : 'Pontos para Vencer'}</label>
                                  <div className="flex items-center justify-between bg-zinc-900 rounded-2xl p-1.5 border border-white/5">
                                    <button 
                                      onClick={() => setMatch(prev => ({ ...prev, pointsToWinSet: Math.max(1, prev.pointsToWinSet - 1) }))}
                                      className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    >
                                      <Minus size={20} />
                                    </button>
                                    <span className="font-black text-xl text-white w-12 text-center">{match.pointsToWinSet}</span>
                                    <button 
                                      onClick={() => setMatch(prev => ({ ...prev, pointsToWinSet: match.pointsToWinSet + 1 }))}
                                      className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    >
                                      <Plus size={20} />
                                    </button>
                                  </div>
                                </div>

                                {match.useSets && (
                                  <div className="space-y-4 md:col-span-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Melhor de (Sets)</label>
                                    <div className="flex items-center justify-between bg-zinc-900 rounded-2xl p-1.5 border border-white/5 max-w-[50%]">
                                      <button 
                                        onClick={() => setMatch(prev => ({ ...prev, maxSets: Math.max(1, prev.maxSets - 1) }))}
                                        className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                      >
                                        <Minus size={20} />
                                      </button>
                                      <span className="font-black text-xl text-white w-12 text-center">{match.maxSets}</span>
                                      <button 
                                        onClick={() => setMatch(prev => ({ ...prev, maxSets: match.maxSets + 1 }))}
                                        className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                      >
                                        <Plus size={20} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'teams' && (
                        <div className="space-y-10">
                          <header className="flex justify-between items-end">
                            <div>
                              <h3 className="text-3xl font-black text-white mb-2">Gerenciar Times</h3>
                              <p className="text-zinc-500">Adicione ou edite os times disponíveis</p>
                            </div>
                            <button 
                              onClick={() => {
                                const newTeam: Team = { id: crypto.randomUUID(), name: 'Novo Time', color: '#6366f1' };
                                setTeams([...teams, newTeam]);
                                setEditingTeam(newTeam);
                              }}
                              className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                            >
                              <Plus size={20} /> Novo Time
                            </button>
                          </header>

                          <div className="grid grid-cols-1 gap-4">
                            {teams.map(team => (
                              <div 
                                key={team.id}
                                className="flex items-center gap-6 p-6 bg-zinc-800/40 rounded-[2rem] border border-white/5 group hover:border-white/20 transition-all"
                              >
                                <div 
                                  className="w-16 h-16 rounded-2xl shadow-2xl border-4 border-white/10"
                                  style={{ backgroundColor: team.color }}
                                />
                                <div className="flex-1">
                                  <span className="block font-black text-xl text-white">{team.name}</span>
                                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{team.color.toUpperCase()}</span>
                                </div>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => setEditingTeam(team)}
                                    className="p-4 bg-zinc-700/50 hover:bg-zinc-600 text-white rounded-2xl transition-all hover:scale-105"
                                  >
                                    <SettingsIcon size={24} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (teams.length > 2) {
                                        setTeams(teams.filter(t => t.id !== team.id));
                                      }
                                    }}
                                    className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all hover:scale-105"
                                  >
                                    <Trash2 size={24} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {settingsTab === 'rules' && (
                        <div className="space-y-10">
                          <header>
                            <h3 className="text-3xl font-black text-white mb-2">Regras e Display</h3>
                            <p className="text-zinc-500">Ajuste o comportamento e a interface do placar</p>
                          </header>

                          <div className="grid grid-cols-1 gap-6">
                            {/* Timer Section */}
                            <div className="p-8 bg-zinc-800/50 rounded-[2.5rem] border border-white/5 space-y-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
                                  <Clock size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-white">Cronômetro</h4>
                              </div>

                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Ativar Cronômetro</span>
                                    <span className="text-xs text-zinc-500">Exibe o tempo no topo da tela</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, useTimer: !prev.useTimer }))}
                                    className={`w-16 h-9 rounded-full transition-all relative ${match.useTimer ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${match.useTimer ? 'left-8.5' : 'left-1.5'}`} />
                                  </button>
                                </div>

                                {match.useTimer && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-6 pt-6 border-t border-white/5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-zinc-200">Modo do Tempo</span>
                                        <span className="text-xs text-zinc-500">Progressivo ou Regressivo</span>
                                      </div>
                                      <div className="flex bg-zinc-900 rounded-xl p-1">
                                        <button 
                                          onClick={() => setMatch(prev => ({ ...prev, timerMode: 'progressive' }))}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${match.timerMode === 'progressive' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                        >
                                          Progressivo
                                        </button>
                                        <button 
                                          onClick={() => setMatch(prev => ({ ...prev, timerMode: 'regressive' }))}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${match.timerMode === 'regressive' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                        >
                                          Regressivo
                                        </button>
                                      </div>
                                    </div>

                                    {match.timerMode === 'regressive' && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                          <span className="font-bold text-zinc-200">Duração Inicial</span>
                                          <span className="text-xs text-zinc-500">Minutos para contagem</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <button 
                                            onClick={() => setMatch(prev => ({ ...prev, timerDuration: Math.max(1, prev.timerDuration - 1) }))}
                                            className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600"
                                          >
                                            <Minus size={16} />
                                          </button>
                                          <span className="text-xl font-black w-12 text-center">{match.timerDuration}</span>
                                          <button 
                                            onClick={() => setMatch(prev => ({ ...prev, timerDuration: prev.timerDuration + 1 }))}
                                            className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600"
                                          >
                                            <Plus size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            {/* Gameplay Rules */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-6 bg-zinc-800/50 rounded-3xl border border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Vantagem</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Diferença de 2 pts</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, useAdvantage: !prev.useAdvantage }))}
                                    className={`w-12 h-7 rounded-full transition-all relative ${match.useAdvantage ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${match.useAdvantage ? 'left-6' : 'left-1'}`} />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Travar Placar</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">No Set Point</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, stopAtSetPoint: !prev.stopAtSetPoint }))}
                                    className={`w-12 h-7 rounded-full transition-all relative ${match.stopAtSetPoint ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${match.stopAtSetPoint ? 'left-6' : 'left-1'}`} />
                                  </button>
                                </div>
                              </div>

                              <div className="p-6 bg-zinc-800/50 rounded-3xl border border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Nomes dos Times</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Sempre Visíveis</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, displayTeamNames: !prev.displayTeamNames }))}
                                    className={`w-12 h-7 rounded-full transition-all relative ${match.displayTeamNames ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${match.displayTeamNames ? 'left-6' : 'left-1'}`} />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Trocar Lados</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Botão Central</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, showSwapButton: !prev.showSwapButton }))}
                                    className={`w-12 h-7 rounded-full transition-all relative ${match.showSwapButton ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${match.showSwapButton ? 'left-6' : 'left-1'}`} />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-200">Tela de Vencedor</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Fim de jogo</span>
                                  </div>
                                  <button 
                                    onClick={() => setMatch(prev => ({ ...prev, showWinnerOverlay: !prev.showWinnerOverlay }))}
                                    className={`w-12 h-7 rounded-full transition-all relative ${match.showWinnerOverlay ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${match.showWinnerOverlay ? 'left-6' : 'left-1'}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'history' && (
                        <div className="space-y-10">
                          <header className="flex justify-between items-end">
                            <div>
                              <h3 className="text-3xl font-black text-white mb-2">Histórico de Partidas</h3>
                              <p className="text-zinc-500">Registros de jogos anteriores e resultados</p>
                            </div>
                            {tournamentHistory.length > 0 && (
                              <button 
                                onClick={() => setShowClearConfirm(true)}
                                className="px-6 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Limpar Tudo
                              </button>
                            )}
                          </header>

                          {tournamentHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-zinc-800/20 rounded-[3rem] border border-white/5 space-y-4">
                              <History size={64} className="text-zinc-700" />
                              <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhuma partida registrada</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tournamentHistory.slice().reverse().map((hist, i) => {
                                const t1 = teams.find(t => t.id === hist.team1.id) || { color: '#fff', name: 'Time 1' };
                                const t2 = teams.find(t => t.id === hist.team2.id) || { color: '#fff', name: 'Time 2' };
                                
                                const date = new Date(hist.date).toLocaleDateString();
                                const time = new Date(hist.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                  <div key={`${hist.id}-${i}`} className="bg-zinc-800/50 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{date} • {time}</span>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full">Partida {tournamentHistory.length - i}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white/10" style={{ backgroundColor: t1.color }} />
                                        <span className="font-bold text-sm text-center truncate w-full">{t1.name}</span>
                                      </div>

                                      <div className="flex flex-col items-center justify-center space-y-1">
                                         <div className="text-3xl font-black tabular-nums tracking-tighter">
                                           {hist.team1.sets} - {hist.team2.sets}
                                         </div>
                                         <span className="text-[10px] font-black text-zinc-500 uppercase">Sets</span>
                                      </div>

                                      <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white/10" style={{ backgroundColor: t2.color }} />
                                        <span className="font-bold text-sm text-center truncate w-full">{t2.name}</span>
                                      </div>
                                    </div>

                                    {hist.setHistory && hist.setHistory.length > 0 && (
                                      <div className="pt-4 flex flex-wrap gap-2 justify-center border-t border-white/5">
                                        {hist.setHistory.map((set, idx) => (
                                          <div key={idx} className="bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-bold">
                                            <span className="text-zinc-500 mr-1.5 font-black uppercase">S{idx + 1}</span>
                                            <span style={{ color: t1.color }}>{set.team1}</span>
                                            <span className="mx-1 text-zinc-700">|</span>
                                            <span style={{ color: t2.color }}>{set.team2}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {settingsTab === 'system' && (
                        <div className="space-y-10">
                          <header>
                            <h3 className="text-3xl font-black text-white mb-2">Sistema e Manutenção</h3>
                            <p className="text-zinc-500">Informações do app e ferramentas de dados</p>
                          </header>

                          <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center justify-between p-8 bg-zinc-800/50 rounded-[2.5rem] border border-white/5">
                              <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-600/20 text-blue-400 rounded-2xl">
                                  <Bell size={28} />
                                </div>
                                <div>
                                  <span className="block font-black text-xl text-white">Versão do Aplicativo</span>
                                  <span className="text-sm text-zinc-500 font-medium">Build v{APP_VERSION}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setIsSettingsOpen(false);
                                  setIsChangelogOpen(true);
                                }}
                                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-all"
                              >
                                Changelog
                              </button>
                            </div>

                            <button 
                              onClick={checkForUpdates}
                              className="flex items-center justify-between p-6 bg-zinc-800/50 rounded-3xl border border-white/5 hover:bg-zinc-800 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600/20 text-green-500 rounded-2xl">
                                  <RefreshCw size={20} />
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-zinc-200">Atualizações</span>
                                  <span className="text-[10px] text-zinc-500 uppercase">Verificar nova versão</span>
                                </div>
                              </div>
                              <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                            </button>

                            <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl">
                                  <Trash2 size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-red-500">Zona de Perigo</h4>
                              </div>
                              <p className="text-sm text-zinc-500 leading-relaxed">
                                A limpeza do torneio apagará permanentemente todo o histórico de partidas salvas. Esta ação não pode ser desfeita.
                              </p>
                              <button 
                                onClick={() => setShowClearConfirm(true)}
                                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3"
                              >
                                <Trash2 size={20} /> Limpar Todos os Dados
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

          {/* Team Edit Overlay */}
            <AnimatePresence>
              {editingTeam && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
                >
                  <div className="bg-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 space-y-6">
                    <h4 className="text-xl font-bold">Editar Time</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-500">Nome do Time</label>
                        <input 
                          type="text"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={editingTeam.name}
                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-zinc-500">Cor do Time</label>
                        <div className="relative w-full h-16 rounded-xl overflow-hidden border-2 border-white/10 focus-within:border-blue-500 transition-colors">
                          <input 
                            type="color"
                            value={editingTeam.color}
                            onChange={(e) => setEditingTeam({ ...editingTeam, color: e.target.value })}
                            className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer opacity-0"
                          />
                          <div 
                            className="w-full h-full flex items-center justify-center font-mono font-bold text-white drop-shadow-md pointer-events-none" 
                            style={{ backgroundColor: editingTeam.color }}
                          >
                            {editingTeam.color.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          setTeams(teams.map(t => t.id === editingTeam.id ? editingTeam : t));
                          setEditingTeam(null);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={20} /> Salvar
                      </button>
                      <button 
                        onClick={() => setEditingTeam(null)}
                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 p-4 rounded-xl font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Nova Partida?</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Ao iniciar uma nova partida, o placar atual será salvo no histórico do torneio.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-4 rounded-xl font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      resetMatch(true);
                      setShowResetConfirm(false);
                    }}
                    className="flex-[1.5] py-4 rounded-xl font-black bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    Sim, Zerar
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setMatch(prev => ({
                      ...prev,
                      team1Score: 0,
                      team2Score: 0,
                      team1Sets: 0,
                      team2Sets: 0,
                      setHistory: [],
                      pointHistory: [],
                    }));
                    setShowResetConfirm(false);
                  }}
                  className="w-full py-4 rounded-xl font-bold text-xs bg-zinc-800/50 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Apenas reiniciar (sem salvar histórico)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Tournament Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Limpar Torneio?</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Tem certeza que deseja apagar todo o histórico do torneio? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-4 rounded-xl font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setTournamentHistory([]);
                    localStorage.removeItem('placar_tournament_history');
                    setMatch(prev => ({
                      ...prev,
                      team1Score: 0,
                      team2Score: 0,
                      team1Sets: 0,
                      team2Sets: 0,
                      setHistory: [],
                    }));
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
                >
                  Sim, limpar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog Modal */}
      <AnimatePresence>
        {isChangelogOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-8"
          >
            <div className="bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                    <Info size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Novidades</h2>
                    <p className="text-zinc-400">O que há de novo no Placar Pro</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChangelogOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                {CHANGELOG.map((log, index) => (
                  <div key={log.version} className={`relative ${index !== CHANGELOG.length - 1 ? 'pb-8 border-b border-white/5' : ''}`}>
                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-white">v{log.version}</h3>
                      <span className="text-sm font-medium text-zinc-500">{log.date}</span>
                    </div>
                    <ul className="space-y-3">
                      {log.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-zinc-300">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-white/10 bg-zinc-800/30 flex justify-end">
                <button 
                  onClick={() => setIsChangelogOpen(false)}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
