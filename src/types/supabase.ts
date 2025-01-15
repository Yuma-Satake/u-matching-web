import { Database } from './database.types';

export type User = Database['public']['Tables']['users']['Row'];
export type UserWithIcon = User & { icon: string };
export type Profile = Database['public']['Tables']['profiles']['Row'];
