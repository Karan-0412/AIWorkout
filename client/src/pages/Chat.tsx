import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Phone, Paperclip, Send, MapPin, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Chat() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [messages] = useState([
    {
      id: "1",
      senderId: "other",
      content: "Hey! I'm interested in splitting this deal. Can we coordinate the purchase?",
      timestamp: "2:34 PM",
      isRead: true,
    },
    {
      id: "2",
      senderId: "me",
      content: "Sure! I can order it today. Which payment method works for you?",
      timestamp: "2:35 PM",
      isRead: true,
    },
  ]);

  const chatPartner = {
    name: "Rahul Kumar",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    rating: 4.8,
    isOnline: true,
  };

  const offer = {
    title: "Sony WH-1000XM4 Headphones",
    splitPrice: "12499",
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In production, this would send the message via Firebase
    setMessage("");
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chats")}
            data-testid="button-back-to-chats"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
            <AvatarFallback>{chatPartner.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold" data-testid="text-partner-name">{chatPartner.name}</h3>
            <p className="text-sm text-muted-foreground">
              ⭐ {chatPartner.rating} • {chatPartner.isOnline ? "Online" : "Offline"}
            </p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-call">
            <Phone className="w-4 h-4 text-accent" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Offer Context Card */}
        <div className="bg-muted/50 rounded-lg p-3 mx-auto max-w-sm" data-testid="offer-context-card">
          <div className="text-center">
            <p className="text-sm font-medium" data-testid="text-offer-title">{offer.title}</p>
            <p className="text-xs text-muted-foreground" data-testid="text-offer-split">
              Split: ₹{offer.splitPrice} each
            </p>
            <Button size="sm" className="mt-2 px-3 py-1 text-xs" data-testid="button-view-offer">
              View Offer
            </Button>
          </div>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2 ${msg.senderId === "me" ? "justify-end" : ""}`}
            data-testid={`message-${msg.id}`}
          >
            {msg.senderId !== "me" && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
                <AvatarFallback>{chatPartner.name[0]}</AvatarFallback>
              </Avatar>
            )}
            <div className={`flex-1 ${msg.senderId === "me" ? "text-right" : ""}`}>
              <div
                className={`rounded-lg p-3 max-w-xs ${
                  msg.senderId === "me"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-card border border-border"
                }`}
              >
                <p className="text-sm" data-testid={`text-message-${msg.id}`}>{msg.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-timestamp-${msg.id}`}>
                {msg.timestamp} {msg.senderId === "me" && msg.isRead && "• Read"}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="flex justify-center space-x-2 py-4">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-2 text-xs rounded-full hover:bg-accent/20 transition-colors"
            data-testid="button-share-location"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Share Location
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-2 text-xs rounded-full hover:bg-accent/20 transition-colors"
            onClick={() => {
              const productLink = "https://amazon.in/sony-wh1000xm4-headphones";
              navigator.clipboard.writeText(productLink);
              // In production, this would add a message to the chat
            }}
            data-testid="button-share-link"
          >
            <Link className="w-3 h-3 mr-1" />
            Share Product Link
          </Button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" data-testid="button-attach">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 rounded-full border-border"
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
