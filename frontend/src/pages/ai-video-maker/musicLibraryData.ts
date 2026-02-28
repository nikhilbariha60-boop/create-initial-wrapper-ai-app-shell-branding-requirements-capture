export interface MusicTrack {
  id: string;
  title: string;
  category: string;
}

const categories = [
  'Trending',
  'Cinematic',
  'Emotional',
  'Motivational',
  'Lo-fi',
  'Hip-hop',
  'Romantic',
  'Sad',
  'Travel',
  'Gaming',
  'Corporate',
  'Background',
];

export function generateMusicLibrary(): MusicTrack[] {
  const tracks: MusicTrack[] = [];
  const tracksPerCategory = Math.ceil(1500 / categories.length);

  categories.forEach((category) => {
    for (let i = 1; i <= tracksPerCategory; i++) {
      tracks.push({
        id: `${category.toLowerCase()}-${i}`,
        title: `${category} Track ${i}`,
        category,
      });
    }
  });

  return tracks.slice(0, 1500);
}

export const MUSIC_CATEGORIES = categories;
