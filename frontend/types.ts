export type MediaType = 'Game' | 'Book' | 'Movie' | 'TV Show';
export type MediaStatus = 'Completed' | 'In-progress' | 'On-hold' | 'Dropped';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  rating: number;
  coverImage: string;
  genre: string;
  dateStarted: string;
  dateFinished?: string;
  hoursSpent: number;
}

export interface User {
  name: string;
  role: string;
  avatar: string;
  email: string;
}
