import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Filter, MapPin, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { OfferCard } from "@/components/OfferCard";
import { JoinOfferBottomSheet } from "@/components/JoinOfferBottomSheet";
import { useThemeContext } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const { toast } = useToast();

  // Mock offers data - in production this would come from Firebase
  const offers = [
    {
      id: "1",
      title: "Sony WH-1000XM4 Wireless Headphones",
      description: "Original price ₹24,999 - Looking for someone to split this amazing deal!",
      originalPrice: "24999",
      splitPrice: "12499",
      offerType: "buy1get1",
      productLink: "https://amazon.in/sony-wh1000xm4-headphones",
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"],
      location: "Koramangala, Bangalore",
      distance: "2.3 km",
      timeAgo: "2h ago",
      user: {
        name: "Rahul Kumar",
        avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        rating: 4.8,
      },
    },
    {
      id: "2",
      title: "PlayStation 5 Controller Bundle",
      description: "Get 3 controllers for ₹11,997. Need 2 people to split!",
      originalPrice: "11997",
      splitPrice: "3999",
      offerType: "buy2get1",
      productLink: "https://flipkart.com/ps5-controller-bundle",
      images: ["https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"],
      location: "Indiranagar, Bangalore",
      distance: "5.1 km",
      timeAgo: "4h ago",
      user: {
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        rating: 4.9,
      },
      joinedUsers: [
        {
          name: "John Doe",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
      ],
    },
    {
      id: "3",
      title: "Nike Air Max Collection",
      description: "Buy any 2 pairs, get 50% off on the second one. Split the savings!",
      originalPrice: "12998",
      splitPrice: "6499",
      offerType: "50percent",
      productLink: "https://nike.com/air-max-collection",
      images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"],
      location: "MG Road, Bangalore",
      distance: "1.8 km",
      timeAgo: "6h ago",
      user: {
        name: "Anjali Patel",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        rating: 4.7,
      },
    },
  ];

  const handleJoinOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
      setIsBottomSheetOpen(true);
    }
  };

  const handleConfirmJoin = (offerId: string, paymentMethod: string) => {
    toast({
      title: "Join request sent!",
      description: "You'll be notified when someone matches with your offer.",
    });
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative transition-theme">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border transition-theme" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-primary" data-testid="text-app-title">OfferShare</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="p-2.5 rounded-full border-2 hover:bg-accent/10 hover:border-accent transition-all duration-200"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-accent" />
              ) : (
                <Moon className="w-4 h-4 text-accent" />
              )}
            </Button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="pb-[calc(env(safe-area-inset-bottom)+88px)]">
        {/* Feed Header */}
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" data-testid="text-feed-title">Active Offers</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                className="px-3 py-1.5 text-sm rounded-full hover:bg-accent/20 transition-colors"
                data-testid="button-filter"
              >
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-3 py-1.5 text-sm rounded-full hover:bg-accent/20 transition-colors"
                data-testid="button-near-me"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Near me
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-card dark:bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Offers Feed */}
        <div className="px-4 space-y-6">
          {(searchQuery.trim() ? offers.filter(o => [o.title, o.description, o.location].some(v => (v || '').toLowerCase().includes(searchQuery.trim().toLowerCase()))) : offers).map((offer) => (
            <div key={offer.id} className="fade-in">
              <OfferCard
                offer={offer}
                onJoin={handleJoinOffer}
              />
            </div>
          ))}

          {searchQuery.trim() && (offers.filter(o => [o.title, o.description, o.location].some(v => (v || '').toLowerCase().includes(searchQuery.trim().toLowerCase()))).length === 0) && (
            <p className="text-center text-sm text-muted-foreground py-8">No offers match your search.</p>
          )}

          {/* Load More Button */}
          <div className="flex justify-center py-8">
            <Button
              variant="outline"
              className="px-8 py-3 text-sm rounded-full hover:bg-accent/10 hover:border-accent transition-colors"
              data-testid="button-load-more"
            >
              Load More Offers
            </Button>
          </div>
        </div>
      </main>

      {/* Join Offer Bottom Sheet */}
      <JoinOfferBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        offer={selectedOffer}
        onConfirm={handleConfirmJoin}
      />

      {/* Floating Action Button */}
      <Button
        onClick={() => navigate("/create")}
        className="fixed bottom-24 right-4 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 border-2 border-background"
        data-testid="button-create-offer"
      >
        <span className="text-2xl font-light">+</span>
      </Button>
    </div>
  );
}
