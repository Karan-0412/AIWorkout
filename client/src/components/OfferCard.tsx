import { useState } from "react";
import { Heart, Info, Share2, MapPin, Clock, Star, ExternalLink, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    description: string;
    originalPrice: string;
    splitPrice: string;
    offerType: string;
    productLink?: string;
    images: string[];
    location: string;
    distance: string;
    timeAgo: string;
    user: {
      name: string;
      avatar: string;
      rating: number;
    };
    joinedUsers?: Array<{ avatar: string; name: string }>;
  };
  onJoin: (offerId: string) => void;
}

export function OfferCard({ offer, onJoin }: OfferCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [, navigate] = useLocation();

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case "buy1get1": return "Buy 1 Get 1 Free";
      case "buy2get1": return "2+1 Free";
      case "50percent": return "50% Off 2nd Item";
      default: return type;
    }
  };

  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case "buy1get1": return "bg-primary text-primary-foreground";
      case "buy2get1": return "bg-accent text-accent-foreground";
      case "50percent": return "bg-green-500 text-white";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <Card className="bg-card dark:bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden" data-testid={`card-offer-${offer.id}`}>
      <div className="relative">
        <img
          src={offer.images[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
          alt={offer.title}
          className="w-full h-48 object-cover"
          data-testid={`img-offer-${offer.id}`}
        />
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-xs font-medium shadow-sm", getOfferTypeColor(offer.offerType))}>
            {getOfferTypeLabel(offer.offerType)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 bg-background/90 dark:bg-background/90 rounded-full hover:bg-background transition-colors backdrop-blur-sm"
            onClick={() => setIsLiked(!isLiked)}
            data-testid={`button-like-${offer.id}`}
          >
            <Heart className={cn("w-4 h-4", isLiked ? "text-destructive fill-destructive" : "text-muted-foreground")} />
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-base leading-tight pr-2" data-testid={`text-title-${offer.id}`}>{offer.title}</h3>
          <div className="text-right">
            <span className="text-lg font-bold text-primary" data-testid={`text-price-${offer.id}`}>₹{offer.splitPrice}</span>
            <p className="text-xs text-muted-foreground line-through">₹{offer.originalPrice}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed" data-testid={`text-description-${offer.id}`}>
          {offer.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span data-testid={`text-distance-${offer.id}`}>{offer.distance}</span>
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span data-testid={`text-time-${offer.id}`}>{offer.timeAgo}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={offer.user.avatar} alt={offer.user.name} />
              <AvatarFallback>{offer.user.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground flex items-center" data-testid={`text-rating-${offer.id}`}>
              {offer.user.rating} <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
            </span>
          </div>
        </div>

        {offer.joinedUsers && offer.joinedUsers.length > 0 && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex -space-x-2">
              {offer.joinedUsers.slice(0, 2).map((user, index) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {offer.joinedUsers.length > 2 && (
                <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{offer.joinedUsers.length - 2}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground" data-testid={`text-joined-${offer.id}`}>
              {offer.joinedUsers.length} person{offer.joinedUsers.length > 1 ? 's' : ''} joined
            </span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => onJoin(offer.id)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg py-3 font-semibold"
            data-testid={`button-join-${offer.id}`}
          >
            Join & Split 50/50
          </Button>
          
          <div className="flex items-center space-x-2">
            {offer.productLink && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => window.open(offer.productLink, '_blank')}
                data-testid={`button-product-link-${offer.id}`}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Product
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="p-2.5"
              onClick={() => navigate(`/chats`)}
              data-testid={`button-chat-${offer.id}`}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-2.5"
              data-testid={`button-info-${offer.id}`}
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-2.5"
              data-testid={`button-share-${offer.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
