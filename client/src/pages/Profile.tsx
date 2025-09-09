import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useThemeContext } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Calendar, ShoppingBag, MessageCircle, LogOut, Sun, Moon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const userStats = {
    offersPosted: 12,
    dealsCompleted: 8,
    rating: 4.8,
    totalRatings: 25,
    memberSince: "January 2024",
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                <AvatarFallback className="text-xl">
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold" data-testid="text-user-name">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium" data-testid="text-user-rating">
                    {userStats.rating} ({userStats.totalRatings} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span data-testid="text-member-since">Member since {userStats.memberSince}</span>
            </div>

            <Button className="w-full" variant="outline" data-testid="button-edit-profile" onClick={() => { setName(user?.displayName || ""); setPhoto(user?.photoURL || ""); setEditOpen(true); }}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold" data-testid="text-offers-count">{userStats.offersPosted}</p>
              <p className="text-sm text-muted-foreground">Offers Posted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold" data-testid="text-deals-count">{userStats.dealsCompleted}</p>
              <p className="text-sm text-muted-foreground">Deals Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Sony Headphones Deal</p>
                <p className="text-xs text-muted-foreground">Completed • 2 days ago</p>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Nike Shoes Offer</p>
                <p className="text-xs text-muted-foreground">Active • 1 week ago</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Gaming Controller Bundle</p>
                <p className="text-xs text-muted-foreground">Matched • 1 week ago</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Matched</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-settings" onClick={() => setSettingsOpen(true)}>
              Settings & Privacy
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-help" onClick={() => window.open('mailto:support@offeshare.example?subject=Support') }>
              Help & Support
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-about" onClick={() => setAboutOpen(true)}>
              About OfferShare
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
              disabled={loading}
              data-testid="button-sign-out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm mb-1 block">Display name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm mb-1 block">Profile photo</label>
              <div className="flex items-center gap-3">
                <div>
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={photoPreview || photo || user?.photoURL || ""} alt={user?.displayName || ""} />
                    <AvatarFallback className="text-xl">{(name || user?.displayName || user?.email || "U")[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) {
                        setSelectedFile(f);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(f);
                      } else {
                        setSelectedFile(null);
                        setPhotoPreview(null);
                      }
                    }}
                    className="block w-full"
                    data-testid="input-profile-photo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a JPG/PNG photo. The image will be uploaded to storage if available.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                if (!user) return;

                let photoUrlToSave: string | null = photo || null;

                // If a new file was selected, try to upload it to Firebase Storage (if configured)
                if (selectedFile) {
                  try {
                    const { isFirebaseConfigured, storage } = await import('@/lib/firebase');
                    if (isFirebaseConfigured && storage) {
                      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                      const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${selectedFile.name}`);
                      await uploadBytes(storageRef, selectedFile);
                      photoUrlToSave = await getDownloadURL(storageRef);
                    } else {
                      // No storage available: use the client-side data URL preview
                      photoUrlToSave = photoPreview as string;
                    }
                  } catch (uploadErr) {
                    console.warn('Photo upload failed, falling back to preview/data URL', uploadErr);
                    photoUrlToSave = photoPreview as string;
                  }
                }

                // Update Firebase profile (auth)
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(user, { displayName: name || null, photoURL: photoUrlToSave || null });

                // Ensure/get backend user id then patch
                try {
                  const res1 = await fetch('/api/users/ensure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firebaseUid: user.uid, email: user.email, displayName: name || user.email || 'User', photoUrl: photoUrlToSave }) });
                  if (res1.ok) {
                    const bu = await res1.json();
                    await fetch(`/api/users/${bu.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: name, photoUrl: photoUrlToSave }) });
                  }
                } catch (e) {
                  console.warn('Backend update failed', e);
                }

                toast({ title: 'Profile updated' });
                setEditOpen(false);
              } catch (e: any) {
                toast({ title: 'Update failed', description: e.message || 'Could not update profile', variant: 'destructive' });
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings & Privacy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Notifications and privacy controls will be available soon.</p>
            <p>Theme: <span className="font-medium">{theme}</span></p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About OfferShare</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Version 1.0.0</p>
            <p>A community-driven way to split deals and save together.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setAboutOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
