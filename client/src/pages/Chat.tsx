import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Phone, Paperclip, Send, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

type ChatItem = { id: string; user1Id?: string; user2Id?: string; lastMessage?: string; lastMessageAt?: string; };
type ChatDisplay = { id: string; lastMessage?: string; lastMessageAt?: string; participant?: { id: string; displayName?: string; photoUrl?: string | null } };
type Message = { id: string; chatId: string; senderId: string; content: string; createdAt?: string; isRead?: boolean; messageType?: 'text' | 'image' | 'file'; fileName?: string; status?: 'sent' | 'delivered' | 'read' };

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
            { id: "sample-2", lastMessage: "Can we meet near MG Road?", lastMessageAt: new Date(Date.now() - 3600_000).toISOString() },
          ]);
        }
      } catch {
        setChats([
          { id: "sample-1", lastMessage: "Hey! Interested in the offer?", lastMessageAt: new Date().toISOString() },
          { id: "sample-2", lastMessage: "Can we meet near MG Road?", lastMessageAt: new Date(Date.now() - 3600_000).toISOString() },
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
  const [attachments, setAttachments] = useState<{ id: string; url: string; name: string; type: 'image' | 'file' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useWs(backendUser?.id);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const u = await ensureBackendUser(user);
        setBackendUser(u);
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (res.ok) {
          const serverMsgs: Message[] = await res.json();
          setMessages(serverMsgs.map(m => ({ ...m, status: m.isRead ? 'read' : 'delivered' })));
          fetch(`/api/chats/${chatId}/mark-read`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) });
        } else {
          setMessages([
            { id: "m1", chatId, senderId: "other", content: "Hi! I'm interested in splitting this deal." },
            { id: "m2", chatId, senderId: "me", content: "Great! Let's coordinate.", status: 'read' },
            { id: "m3", chatId, senderId: "other", content: "I'm free this evening around 6 PM." },
            { id: "m4", chatId, senderId: "me", content: "Perfect, see you at Koramangala Starbucks.", status: 'delivered' },
          ]);
        }
      } catch {
        setMessages([
          { id: "m1", chatId, senderId: "other", content: "Hi! I'm interested in splitting this deal." },
          { id: "m2", chatId, senderId: "me", content: "Great! Let's coordinate.", status: 'read' },
          { id: "m3", chatId, senderId: "other", content: "I'm free this evening around 6 PM." },
          { id: "m4", chatId, senderId: "me", content: "Perfect, see you at Koramangala Starbucks.", status: 'delivered' },
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
    const text = message.trim();
    if (!text && attachments.length === 0) return;
    setMessage("");

    const sendOne = async (payload: { content: string; messageType?: 'text'|'image'|'file'; fileName?: string }) => {
      const id = Math.random().toString();
      const local: Message = { id, chatId, senderId: backendUser?.id || 'me', content: payload.content, messageType: payload.messageType, fileName: payload.fileName, status: 'sent' };
      if (backendUser) {
        const socketPayload = { type: 'chat_message', chatId, senderId: backendUser.id, content: payload.content, messageType: payload.messageType } as any;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(socketPayload));
        } else {
          try {
            await fetch(`/api/chats/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: backendUser.id, content: payload.content, messageType: payload.messageType }) });
          } catch {}
        }
      }
      setMessages((m) => [...m, local]);
      // Simulate delivered and read progression
      setTimeout(() => setMessages(m => m.map(mm => mm.id === id ? { ...mm, status: 'delivered' } : mm)), 1000);
      setTimeout(() => setMessages(m => m.map(mm => mm.id === id ? { ...mm, status: 'read' } : mm)), 4000);
    };

    if (text) {
      await sendOne({ content: text, messageType: 'text' });
    }

    for (const a of attachments) {
      await sendOne({ content: a.url, messageType: a.type === 'image' ? 'image' : 'file', fileName: a.name });
    }

    setAttachments([]);
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

      <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar bg-background">
        {messages.map((msg) => {
          const isMe = msg.senderId === (backendUser?.id || 'me');
          const isImage = msg.messageType === 'image' || msg.content.startsWith('data:image/');
          const isFile = msg.messageType === 'file' && !isImage;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <Avatar className="w-8 h-8 shrink-0"><AvatarFallback>U</AvatarFallback></Avatar>
              )}
              <div className={`max-w-[70%] ${isMe ? 'items-end text-right' : ''}`}>
                <div className={`relative rounded-2xl shadow ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'}`}>
                  {isImage ? (
                    <img src={msg.content} alt={msg.fileName || 'image'} className={`rounded-2xl ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} max-h-64 object-cover ${isMe ? 'ring-2 ring-primary' : ''}`} />
                  ) : isFile ? (
                    <a href={msg.content} download={msg.fileName || 'file'} className="block px-4 py-3 text-sm underline underline-offset-2">
                      {msg.fileName || 'Attachment'}
                    </a>
                  ) : (
                    <p className="px-4 py-3 text-sm leading-relaxed">{msg.content}</p>
                  )}
                  {isMe && (
                    <span className="absolute -bottom-4 right-1 flex items-center gap-0.5 text-[10px]">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Check className="w-3 h-3 text-muted-foreground" />
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-[10px] text-muted-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          );
        })}
      </div>

      {attachments.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {attachments.map(a => (
            <div key={a.id} className="relative w-16 h-16 rounded-md border border-border overflow-hidden">
              {a.type === 'image' ? (
                <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs p-2 text-center">{a.name}</div>
              )}
              <button className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs" onClick={() => setAttachments(prev => prev.filter(x => x.id !== a.id))}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach((f) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const url = String(reader.result);
                  setAttachments(prev => [...prev, { id: Math.random().toString(), url, name: f.name, type: f.type.startsWith('image/') ? 'image' : 'file' }]);
                };
                reader.readAsDataURL(f);
              });
              e.currentTarget.value = '';
            }}
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-full">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full border-border"
          />
          <Button onClick={handleSend} size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
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
