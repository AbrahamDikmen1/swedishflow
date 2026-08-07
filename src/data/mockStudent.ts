import { StudentDashboardData } from '../types/student';

export const mockStudentDashboard: StudentDashboardData = {
  user: {
    id: 'user_sofia_01',
    firstName: 'Sofia',
    greeting: 'God morgon',
    levelCode: 'A1',
    levelTitle: 'Nybörjare',
    completedMissionsCount: 0,
    totalMissionsCount: 3,
  },
  currentMission: {
    id: '1',
    tagLabel: 'Aktuellt uppdrag',
    title: 'Hälsa och presentera dig',
    description: 'Lär dig hälsa, berätta vad du heter och fråga vad någon heter.',
    currentStepNumber: 1,
    totalStepsCount: 13,
    estimatedMinutes: 6,
  },
  dailyMission: {
    id: '1',
    title: 'Dagens uppdrag',
    taskTitle: 'Hälsa och presentera dig',
    instruction: 'Lär dig hälsa, berätta vad du heter och fråga vad någon heter.',
  },
  weeklyProgress: {
    completedDaysCount: 0,
    totalDaysCount: 7,
    days: [
      { dayLabel: 'Må', isCompleted: false, isCurrent: false },
      { dayLabel: 'Ti', isCompleted: false, isCurrent: false },
      { dayLabel: 'On', isCompleted: false, isCurrent: false },
      { dayLabel: 'To', isCompleted: false, isCurrent: true },
      { dayLabel: 'Fr', isCompleted: false, isCurrent: false },
      { dayLabel: 'Lö', isCompleted: false, isCurrent: false },
      { dayLabel: 'Sö', isCompleted: false, isCurrent: false },
    ],
  },
};
