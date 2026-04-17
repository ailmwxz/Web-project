export interface Workout{ 
    id: number; 
    name: string; 
    description?: string;
    category?: string; 
    muscle_group?: string;
    duration: number; 
    kcal_burn: number;
    gif_url?: string; 
    instruction?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    date: string;
}

export interface User {
  id: number;
  username: string;
  token: string;
}

export interface DashboardData {
  dailyCalories: number;
  goalCalories: number;
  recentWorkouts: Workout[];
}