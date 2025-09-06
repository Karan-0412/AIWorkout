import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Phone, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

type ChatItem = { id: string; lastMessage?: string; lastMessageAt?: string };
type Message = { id: string; chatId: string; senderId: string; content: string; createdAt?: string; isRead?: boolean };

async function ensureBackendUser(firebaseUser: any) {
  const res = await fetch("/api/users/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email,
      photoUrl: firebaseUser.photoURL,
    }),
  });
  if (!res.ok) throw new Error("Failed to ensure user");
  return res.json();
}

function useWs(userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!userId) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws?userId=${userId}`);
    wsRef.current = ws;
    return () => ws.close();
  }, [userId]);
  return wsRef;
}

function ChatsList() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [backendUser, setBackendUser] = useState<any>();
  const [chats, setChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const u = await ensureBackendUser(user);
        setBackendUser(u);
        const res = await fetch(`/api/users/${u.id}/chats`);
        if (res.ok) {
          setChats(await res.json());
        } else {
          setChats([
            { id: "sample-1", lastMessage: "Hey! Interested in the offer?", lastMessageAt: new Date().toISOString() },
          ]);
        }
      } catch {
        setChats([
          { id: "sample-1", lastMessage: "Hey! Interested in the offer?", lastMessageAt: new Date().toISOString() },
        ]);
      }
    })();
  }, [user]);

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <header className="sticky top-0 bg-background border-b border-border p-4 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <h2 className="text-lg font-semibold">Chats</h2>
      </header>
      <div className="p-2 space-y-2">
        {chats.map((c) => (
          <button key={c.id} onClick={() => navigate(`/chat/${c.id}`)} className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chat</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{c.lastMessage || "No messages yet"}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString() : ""}</span>
            </div>
          </button>
        ))}
        {chats.length === 0 && <p className="text-center text-sm text-muted-foreground p-6">No chats yet. Sample chat will appear once you open one.</p>}
      </div>
    </div>
  );
}

function ChatRoom({ chatId }: { chatId: string }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [backendUser, setBackendUser] = useState<any>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const wsRef = useWs(backendUser?.id);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const u = await ensureBackendUser(user);
        setBackendUser(u);
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (res.ok) {
          setMessages(await res.json());
          fetch(`/api/chats/${chatId}/mark-read`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) });
        } else {
          setMessages([
            { id: "m1", chatId, senderId: "other", content: "Hi! I'm interested in splitting this deal." },
            { id: "m2", chatId, senderId: "me", content: "Great! Let's coordinate." },
          ]);
        }
      } catch {
        setMessages([
          { id: "m1", chatId, senderId: "other", content: "Hi! I'm interested in splitting this deal." },
          { id: "m2", chatId, senderId: "me", content: "Great! Let's coordinate." },
        ]);
      }
    })();
  }, [user, chatId]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "new_message") {
          setMessages((m) => [...m, data.message]);
        }
      } catch {}
    };
  }, [wsRef]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const text = message.trim();
    setMessage("");
    if (backendUser) {
      const payload = { type: "chat_message", chatId, senderId: backendUser.id, content: text } as any;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        try {
          await fetch(`/api/chats/${chatId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senderId: backendUser.id, content: text }) });
        } catch {}
      }
      setMessages((m) => [...m, { id: Math.random().toString(), chatId, senderId: backendUser.id, content: text }]);
    } else {
      setMessages((m) => [...m, { id: Math.random().toString(), chatId, senderId: "me", content: text }]);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <header className="bg-card border-b border-border p-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/chats")} data-testid="button-back-to-chats">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">Chat</h3>
            <p className="text-sm text-muted-foreground">Secure</p>
          </div>
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4 text-accent" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === backendUser?.id;
          return (
            <div key={msg.id} className={`flex items-start space-x-2 ${isMe ? "justify-end" : ""}`}>
              {!isMe && (
                <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>
              )}
              <div className={`flex-1 ${isMe ? "text-right" : ""}`}>
                <div className={`rounded-lg p-3 max-w-xs ${isMe ? "bg-primary text-primary-foreground ml-auto" : "bg-card border border-border"}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full border-border"
          />
          <Button onClick={handleSend} size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const [isChat, params] = useRoute("/chat/:id");
  if (isChat) return <ChatRoom chatId={(params as any).id} />;
  return <ChatsList />;
}
