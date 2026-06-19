export interface User {
  id: number;
  name: string;
  email: string;
  team_id: number;
  role: "member" | "manager";
}

export interface Team {
  id: number;
  name: string;
  invite_code: string;
}

export interface StandupEntry {
  id: number;
  user_id: number;
  team_id: number;
  yesterday: string;
  today: string;
  has_blocker: boolean;
  entry_date: string;
  created_at: string;
}

export interface Blocker {
  id: number;
  description: string;
  userName: string;
  hoursOpen: number;
  isFlagged: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  postedToday: boolean;
  streakLast7Days: number;
}

export interface Dashboard {
  teamMembers: TeamMember[];
  activeBlockers: Blocker[];
  flaggedBlockerCount: number;
  generatedAt: string;
  cached: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  team: Team;
}
