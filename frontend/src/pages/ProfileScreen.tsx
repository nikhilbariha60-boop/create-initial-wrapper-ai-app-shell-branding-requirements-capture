import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, Save, Copy, Check } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfile';
import { toast } from 'sonner';

export default function ProfileScreen() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();

  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [copied, setCopied] = useState(false);

  const principal = identity?.getPrincipal().toString() || '';

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setAvatar(userProfile.avatar);
    }
  }, [userProfile]);

  const handleSave = () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    saveProfile(
      {
        displayName: displayName.trim(),
        avatar: avatar.trim(),
        principal: identity!.getPrincipal(),
      },
      {
        onSuccess: () => {
          toast.success('Profile saved successfully');
        },
        onError: (error) => {
          toast.error('Failed to save profile');
          console.error('Save profile error:', error);
        },
      }
    );
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    setCopied(true);
    toast.success('Principal copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-2">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
          <User className="h-4 w-4" />
          <span>User Profile</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Your Profile
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your display name and avatar. Your changes will be saved to the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {displayName ? getInitials(displayName) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to an image for your avatar
              </p>
            </div>
          </div>

          <Separator />

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <Separator />

          {/* Principal ID */}
          <div className="space-y-2">
            <Label>Internet Identity Principal</Label>
            <div className="flex gap-2">
              <Input
                value={principal}
                readOnly
                className="font-mono text-xs bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPrincipal}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your unique identifier on the Internet Computer
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !displayName.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1 sm:flex-initial"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
