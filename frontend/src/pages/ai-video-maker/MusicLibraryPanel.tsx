import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Play, Check } from 'lucide-react';
import { generateMusicLibrary, MUSIC_CATEGORIES, MusicTrack } from './musicLibraryData';

interface MusicLibraryPanelProps {
  onSelectTrack: (trackTitle: string) => void;
  selectedTrack: string | null;
}

export default function MusicLibraryPanel({ onSelectTrack, selectedTrack }: MusicLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const allTracks = useMemo(() => generateMusicLibrary(), []);

  const filteredTracks = useMemo(() => {
    return allTracks.filter((track) => {
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || track.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allTracks, searchQuery, categoryFilter]);

  return (
    <Card className="shadow-sm border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <div>
            <CardTitle className="text-xl">Music Library</CardTitle>
            <CardDescription>
              {allTracks.length} tracks available
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {MUSIC_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Track List */}
        <ScrollArea className="h-[300px] border rounded-md">
          <div className="p-4 space-y-2">
            {filteredTracks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tracks found
              </p>
            ) : (
              filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-xs text-muted-foreground">{track.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* Placeholder play preview */
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedTrack === track.title ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSelectTrack(track.title)}
                    >
                      {selectedTrack === track.title ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {selectedTrack && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>Selected:</strong> {selectedTrack}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
