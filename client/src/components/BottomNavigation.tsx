import { useLocation } from "wouter";
import { Home, Plus, MessageCircle, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/", testId: "nav-home" },
    { icon: Plus, label: "Post", path: "/create", testId: "nav-post" },
    { icon: Map, label: "Map", path: "/map", testId: "nav-map" },
    { icon: MessageCircle, label: "Chats", path: "/chats", testId: "nav-chats" },
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50 transition-theme shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-3">
        {navItems.map(({ icon: Icon, label, path, testId }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center p-2 transition-all duration-200 rounded-lg",
              location === path
                ? "text-primary bg-primary/10 scale-105"
                : "text-muted-foreground hover:text-primary hover:bg-accent/10"
            )}
            data-testid={testId}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
            {(path === "/chats" && location !== "/chats") && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-xs text-destructive-foreground rounded-full flex items-center justify-center">
                2
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
