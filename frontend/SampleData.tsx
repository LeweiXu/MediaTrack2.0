
import { MediaItem, User } from './types';

export const CURRENT_USER: User = {
  name: "Test User",
  role: "Pro Member",
  avatar: "https://picsum.photos/seed/alex/100/100",
  email: "alex.rivera@example.com"
};

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    type: 'Game',
    status: 'Completed',
    rating: 4.0,
    coverImage: 'https://picsum.photos/seed/cyberpunk/400/600',
    genre: 'RPG',
    dateStarted: '2024-01-01',
    hoursSpent: 80
  },
  {
    id: '2',
    title: 'The Silent Patient',
    type: 'Book',
    status: 'In-progress',
    rating: 5.0,
    coverImage: 'https://picsum.photos/seed/silent/400/600',
    genre: 'Thriller',
    dateStarted: '2024-02-10',
    hoursSpent: 5
  },
  {
    id: '3',
    title: 'Oppenheimer',
    type: 'Movie',
    status: 'Completed',
    rating: 4.5,
    coverImage: 'https://picsum.photos/seed/oppen/400/600',
    genre: 'Biography',
    dateStarted: '2024-01-15',
    hoursSpent: 3
  },
  {
    id: '4',
    title: 'Succession',
    type: 'TV Show',
    status: 'On-hold',
    rating: 4.9,
    coverImage: 'https://picsum.photos/seed/succession/400/600',
    genre: 'Drama',
    dateStarted: '2024-03-01',
    hoursSpent: 40
  },
  {
    id: '5',
    title: 'Elden Ring',
    type: 'Game',
    status: 'In-progress',
    rating: 5.0,
    coverImage: 'https://picsum.photos/seed/elden/400/600',
    genre: 'RPG',
    dateStarted: '2024-04-01',
    hoursSpent: 120
  },
  {
    id: '6',
    title: 'Project Hail Mary',
    type: 'Book',
    status: 'Completed',
    rating: 5.0,
    coverImage: 'https://picsum.photos/seed/hail/400/600',
    genre: 'Sci-Fi',
    dateStarted: '2024-02-01',
    hoursSpent: 15
  }
];