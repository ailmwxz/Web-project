export interface Exercise{ 
    id: number; 
    name: string; 
    description: Text;
    category: string; 
    muscle_group: string;
    duration: number; 
    kcal_burn: number;
    gif_url: string; 
    instruction: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}