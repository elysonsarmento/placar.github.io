/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, RotateCcw, Plus, Minus, X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, MatchState, DEFAULT_TEAMS } from './types';

export default function App() {
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
      useSets: true,
      displayTeamNames: false,
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultMatch,
          ...parsed,
          // Ensure arrays are initialized if missing in old storage
          setHistory: parsed.setHistory || [],
          useSets: parsed.useSets !== undefined ? parsed.useSets : true,
          displayTeamNames: parsed.displayTeamNames !== undefined ? parsed.displayTeamNames : false,
        };
      } catch (e) {
        return defaultMatch;
      }
    }
    return defaultMatch;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    localStorage.setItem('placar_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('placar_match', JSON.stringify(match));
  }, [match]);

  const updateScore = useCallback((teamNum: 1 | 2, delta: number) => {
    setMatch(prev => {
      const scoreKey = teamNum === 1 ? 'team1Score' : 'team2Score';
      const newScore = Math.max(0, prev[scoreKey] + delta);
      return { ...prev, [scoreKey]: newScore };
    });
  }, []);

  const updateSets = useCallback((teamNum: 1 | 2, delta: number) => {
    setMatch(prev => {
      const setKey = teamNum === 1 ? 'team1Sets' : 'team2Sets';
      const newSets = Math.max(0, Math.min(prev.maxSets, prev[setKey] + delta));
      return { ...prev, [setKey]: newSets };
    });
  }, []);

  const nextSet = useCallback((winner: 1 | 2) => {
    setMatch(prev => ({
      ...prev,
      setHistory: [...prev.setHistory, { team1: prev.team1Score, team2: prev.team2Score }],
      team1Score: 0,
      team2Score: 0,
      team1Sets: winner === 1 ? prev.team1Sets + 1 : prev.team1Sets,
      team2Sets: winner === 2 ? prev.team2Sets + 1 : prev.team2Sets,
    }));
  }, []);

  const resetMatch = useCallback((force = false) => {
    const performReset = () => {
      setMatch(prev => ({
        ...prev,
        team1Score: 0,
        team2Score: 0,
        team1Sets: 0,
        team2Sets: 0,
        setHistory: [],
      }));
    };

    if (force) {
      performReset();
    } else {
      performReset();
    }
  }, []);

  const team1 = teams.find(t => t.id === match.team1Id) || teams[0];
  const team2 = teams.find(t => t.id === match.team2Id) || teams[1];

  const team1WinsSet = match.useSets && match.team1Score >= match.pointsToWinSet && match.team1Score >= match.team2Score + 2;
  const team2WinsSet = match.useSets && match.team2Score >= match.pointsToWinSet && match.team2Score >= match.team1Score + 2;

  const setsToWin = Math.ceil(match.maxSets / 2);
  const matchWinner = match.useSets ? (match.team1Sets >= setsToWin ? 1 : match.team2Sets >= setsToWin ? 2 : null) : null;

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">
      {/* Sets Display (Top Center) */}
      {match.useSets && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-4 z-30 p-4">
          <div className="flex gap-2">
            <div 
              className="bg-white px-6 py-2 rounded-xl border border-white/20 text-4xl font-black tabular-nums min-w-[80px] text-center shadow-xl"
              style={{ color: team1.color }}
            >
              {match.team1Sets}
            </div>
            <div 
              className="bg-white px-6 py-2 rounded-xl border border-white/20 text-4xl font-black tabular-nums min-w-[80px] text-center shadow-xl"
              style={{ color: team2.color }}
            >
              {match.team2Sets}
            </div>
          </div>
        </div>
      )}

      {/* Main Scoreboard */}
      <div className="flex h-full w-full">
        {/* Team 1 Area */}
        <div 
          className="relative flex-1 flex flex-col items-center justify-center cursor-pointer active:opacity-95 transition-all"
          style={{ backgroundColor: team1.color }}
          onClick={() => !matchWinner && updateScore(1, 1)}
        >
          {match.displayTeamNames && (
            <div className="absolute top-16 text-4xl font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md">
              {team1.name}
            </div>
          )}
          
          <div className={`font-black leading-none tabular-nums drop-shadow-2xl transition-all duration-300 ${match.team1Score >= 100 ? 'text-[14rem]' : match.team1Score >= 10 ? 'text-[20rem]' : 'text-[32rem]'}`}>
            {match.team1Score}
          </div>

          {/* Next Set Button Overlay */}
          <AnimatePresence>
            {team1WinsSet && !matchWinner && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-1/2 -translate-y-1/2 bg-white text-black px-12 py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSet(1);
                }}
              >
                FECHAR SET
              </motion.button>
            )}
          </AnimatePresence>

          {/* Decrement Button */}
          <button 
            className="absolute bottom-8 left-8 p-6 bg-black/20 rounded-full hover:bg-black/40 transition-colors border border-white/5"
            onClick={(e) => {
              e.stopPropagation();
              updateScore(1, -1);
            }}
          >
            <Minus size={48} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-1 bg-black/30 z-10" />

        {/* Team 2 Area */}
        <div 
          className="relative flex-1 flex flex-col items-center justify-center cursor-pointer active:opacity-95 transition-all"
          style={{ backgroundColor: team2.color }}
          onClick={() => !matchWinner && updateScore(2, 1)}
        >
          {match.displayTeamNames && (
            <div className="absolute top-16 text-4xl font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md">
              {team2.name}
            </div>
          )}
          
          <div className={`font-black leading-none tabular-nums drop-shadow-2xl transition-all duration-300 ${match.team2Score >= 100 ? 'text-[14rem]' : match.team2Score >= 10 ? 'text-[20rem]' : 'text-[32rem]'}`}>
            {match.team2Score}
          </div>

          {/* Next Set Button Overlay */}
          <AnimatePresence>
            {team2WinsSet && !matchWinner && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-1/2 -translate-y-1/2 bg-white text-black px-12 py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSet(2);
                }}
              >
                FECHAR SET
              </motion.button>
            )}
          </AnimatePresence>

          {/* Decrement Button */}
          <button 
            className="absolute bottom-8 right-8 p-6 bg-black/20 rounded-full hover:bg-black/40 transition-colors border border-white/5"
            onClick={(e) => {
              e.stopPropagation();
              updateScore(2, -1);
            }}
          >
            <Minus size={48} />
          </button>
        </div>
      </div>

      {/* Set History */}
      {match.useSets && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {(match.setHistory || []).map((set, i) => (
            <div key={i} className="bg-white px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center min-w-[80px] shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Set {i + 1}</span>
              <div className="flex gap-2 font-bold text-lg">
                <span style={{ color: team1.color }}>{set.team1}</span>
                <span className="text-zinc-200">|</span>
                <span style={{ color: team2.color }}>{set.team2}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Winner Overlay */}
      <AnimatePresence>
        {matchWinner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
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
                Placar Final: {match.team1Sets} - {match.team2Sets}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        <button 
          className="p-5 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-2xl active:scale-90"
          onClick={() => resetMatch(true)}
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

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-8"
          >
            <div className="bg-zinc-900 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-800/30">
                <h2 className="text-3xl font-bold tracking-tight">Configurações do Jogo</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Match Setup */}
                <section className="space-y-8">
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Partida</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Time da Esquerda</label>
                      <select 
                        className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-5 text-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                        value={match.team1Id}
                        onChange={(e) => setMatch(prev => ({ ...prev, team1Id: e.target.value }))}
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-center">
                      <div className="px-4 py-2 rounded-full bg-zinc-800 text-zinc-500 font-black text-xs">VERSUS</div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Time da Direita</label>
                      <select 
                        className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-5 text-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                        value={match.team2Id}
                        onChange={(e) => setMatch(prev => ({ ...prev, team2Id: e.target.value }))}
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Rules Setup */}
                <section className="space-y-8">
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Regras</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                      <span className="font-bold text-zinc-300">Mostrar Nomes</span>
                      <button 
                        onClick={() => setMatch(prev => ({ ...prev, displayTeamNames: !prev.displayTeamNames }))}
                        className={`w-14 h-8 rounded-full transition-colors relative ${match.displayTeamNames ? 'bg-blue-600' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${match.displayTeamNames ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                      <span className="font-bold text-zinc-300">Usar Sets</span>
                      <button 
                        onClick={() => setMatch(prev => ({ ...prev, useSets: !prev.useSets }))}
                        className={`w-14 h-8 rounded-full transition-colors relative ${match.useSets ? 'bg-blue-600' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${match.useSets ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {match.useSets && (
                      <>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-400 uppercase">Melhor de (Sets)</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 3, 5].map(s => (
                              <button 
                                key={s}
                                onClick={() => setMatch(prev => ({ ...prev, maxSets: s }))}
                                className={`p-4 rounded-xl font-bold transition-all ${match.maxSets === s ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                              >
                                {s}
                              </button>
                            ))}
                            <input 
                              type="number"
                              placeholder="Outro"
                              className="bg-zinc-800 border border-white/10 rounded-xl p-4 font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                              value={match.maxSets}
                              onChange={(e) => setMatch(prev => ({ ...prev, maxSets: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-400 uppercase">Pontos por Set</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[15, 21, 25, 30].map(p => (
                              <button 
                                key={p}
                                onClick={() => setMatch(prev => ({ ...prev, pointsToWinSet: p }))}
                                className={`p-4 rounded-xl font-bold transition-all ${match.pointsToWinSet === p ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                              >
                                {p}
                              </button>
                            ))}
                            <input 
                              type="number"
                              placeholder="Customizado"
                              className="col-span-2 bg-zinc-800 border border-white/10 rounded-xl p-4 font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                              value={match.pointsToWinSet}
                              onChange={(e) => setMatch(prev => ({ ...prev, pointsToWinSet: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Teams Management */}
                <section className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Times</h3>
                    <button 
                      onClick={() => {
                        const newTeam: Team = { id: Date.now().toString(), name: 'Novo Time', color: '#6366f1' };
                        setTeams([...teams, newTeam]);
                        setEditingTeam(newTeam);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                    >
                      <Plus size={24} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teams.map(team => (
                      <div 
                        key={team.id}
                        className="flex items-center gap-4 p-4 bg-zinc-800/40 rounded-2xl border border-white/5 group hover:border-white/20 transition-all"
                      >
                        <div 
                          className="w-12 h-12 rounded-xl shadow-inner"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="flex-1 font-bold text-lg">{team.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingTeam(team)}
                            className="p-2 hover:bg-white/10 rounded-lg"
                          >
                            <SettingsIcon size={20} />
                          </button>
                          <button 
                            onClick={() => {
                              if (teams.length > 2) {
                                setTeams(teams.filter(t => t.id !== team.id));
                              }
                            }}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
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
                        <div className="grid grid-cols-5 gap-3">
                          {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#ffffff'].map(c => (
                            <button 
                              key={c}
                              className={`w-full aspect-square rounded-lg border-2 transition-transform active:scale-90 ${editingTeam.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                              onClick={() => setEditingTeam({ ...editingTeam, color: c })}
                            />
                          ))}
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
    </div>
  );
}
