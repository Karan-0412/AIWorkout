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
import { Star, MapPin, Calendar, ShoppingBag, MessageCircle, LogOut, Sun, Moon } from "lucide-react";

export function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-md mx-auto bg-background min-h-screen pb-20">
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

            <Button className="w-full" variant="outline" data-testid="button-edit-profile">
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
            <Button variant="ghost" className="w-full justify-start" data-testid="button-settings">
              Settings & Privacy
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-help">
              Help & Support
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-about">
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
    </div>
  );
}
