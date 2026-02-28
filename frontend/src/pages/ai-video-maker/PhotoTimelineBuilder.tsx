import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoTimelineBuilderProps {
  photoOrder: string[];
  onPhotoOrderChange: (order: string[]) => void;
}

export default function PhotoTimelineBuilder({ photoOrder, onPhotoOrderChange }: PhotoTimelineBuilderProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file) => file.name);
    const updatedPhotos = [...photoOrder, ...newPhotos];
    onPhotoOrderChange(updatedPhotos);
    toast.success(`${newPhotos.length} photo(s) uploaded`);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photoOrder.filter((_, i) => i !== index);
    onPhotoOrderChange(updatedPhotos);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedPhotos = [...photoOrder];
    [updatedPhotos[index - 1], updatedPhotos[index]] = [updatedPhotos[index], updatedPhotos[index - 1]];
    onPhotoOrderChange(updatedPhotos);
  };

  const handleMoveDown = (index: number) => {
    if (index === photoOrder.length - 1) return;
    const updatedPhotos = [...photoOrder];
    [updatedPhotos[index], updatedPhotos[index + 1]] = [updatedPhotos[index + 1], updatedPhotos[index]];
    onPhotoOrderChange(updatedPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
      </div>

      {/* Photo List */}
      {photoOrder.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {photoOrder.map((photo, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="text-sm truncate">{photo}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === photoOrder.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border-2 border-dashed rounded-lg">
          <Image className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No photos uploaded yet
          </p>
          <p className="text-xs text-muted-foreground">
            Upload images to build your video timeline
          </p>
        </div>
      )}
    </div>
  );
}
