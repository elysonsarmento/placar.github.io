export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface MatchState {
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  team1Sets: number;
  team2Sets: number;
  maxSets: number;
  pointsToWinSet: number;
  setHistory: { team1: number; team2: number }[];
  useSets: boolean;
  displayTeamNames: boolean;
  sidesSwapped: boolean;
  showSwapButton: boolean;
  autoSwapOnRotate: boolean;
  keepScreenAwake: boolean;
}

export const DEFAULT_TEAMS: Team[] = [
  { id: '1', name: 'Time A', color: '#ef4444' }, // Red
  { id: '2', name: 'Time B', color: '#3b82f6' }, // Blue
  { id: '3', name: 'Time C', color: '#10b981' }, // Green
  { id: '4', name: 'Time D', color: '#f59e0b' }, // Amber
];
