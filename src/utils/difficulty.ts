import { Difficulty } from '../types';

export function getDifficultyColor(difficulty: Difficulty): string {
  const colors = {
    easy: 'bg-green-500 text-white',
    moderate: 'bg-yellow-500 text-white',
    hard: 'bg-orange-500 text-white',
    expert: 'bg-red-500 text-white',
  };
  return colors[difficulty];
}

export function getExperienceBadgeColor(experience: string): string {
  const colors = {
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    advanced: 'bg-orange-100 text-orange-700 border-orange-200',
    expert: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[experience as keyof typeof colors] || colors.beginner;
}
