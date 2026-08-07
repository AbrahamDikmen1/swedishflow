export interface StudentUser {
  id: string;
  firstName: string;
  lastName?: string;
  greeting: string;
  levelCode: string; // e.g. 'A1'
  levelTitle: string; // e.g. 'Nybörjare'
  completedMissionsCount: number;
  totalMissionsCount: number;
}

export interface CurrentMission {
  id: string;
  tagLabel: string; // e.g. 'Fortsätt där du slutade'
  title: string; // e.g. 'Berätta vem du är'
  description: string; // e.g. 'Träna på namn, ursprung och var du bor.'
  currentStepNumber: number; // 4
  totalStepsCount: number; // 12
  estimatedMinutes: number; // 8
}

export interface DailyMission {
  id: string;
  title: string; // e.g. 'Dagens uppdrag'
  taskTitle: string; // e.g. 'Presentera dig på svenska'
  instruction: string; // e.g. 'Säg eller skriv tre meningar om dig själv.'
}

export interface WeeklyDayActivity {
  dayLabel: string; // e.g. 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö'
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface WeeklyProgressData {
  completedDaysCount: number;
  totalDaysCount: number;
  days: WeeklyDayActivity[];
}

export interface StudentDashboardData {
  user: StudentUser;
  currentMission: CurrentMission;
  dailyMission: DailyMission;
  weeklyProgress: WeeklyProgressData;
}
