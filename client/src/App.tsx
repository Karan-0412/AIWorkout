import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Home } from "@/pages/Home";
import { CreateOffer } from "@/pages/CreateOffer";
import { Chat } from "@/pages/Chat";
import { Profile } from "@/pages/Profile";
import { Auth } from "@/pages/Auth";
import Map from "@/pages/Map";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="bg-background min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={CreateOffer} />
        <Route path="/chats" component={Chat} />
        <Route path="/chat/:id" component={Chat} />
        <Route path="/wallet">
          <div className="max-w-md mx-auto bg-background min-h-screen flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Wallet</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        </Route>
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
