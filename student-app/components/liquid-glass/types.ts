import type { ReactNode } from 'react';
export type StudyPlanFilter = 'Today' | 'Upcoming' | 'Completed' | 'Subject';
export type GlassButtonVariant = 'primary' | 'secondary' | 'glass' | 'bordered' | 'destructive' | 'icon' | 'text';
export interface StudyPlanItem { id: string; title: string; subject: string; duration: number; priority: 'High' | 'Medium' | 'Low'; dueLabel: string; completed: boolean; }
export interface SubjectProgress { id: string; name: string; progress: number; nextLesson: string; }
export interface GlassSurfaceProps { children: ReactNode; style?: object; padding?: number; intensity?: number; }
