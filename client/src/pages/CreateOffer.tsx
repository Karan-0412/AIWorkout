import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function CreateOffer() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [type, setType] = useState(""); // service | product | help
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
      },
      () => toast({ title: "Failed to get location", variant: "destructive" })
    );
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;
    if (!supabase) {
      toast({ title: "Supabase not configured", description: "Connect Supabase and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", variant: "destructive" });
      throw new Error("Supabase not configured");
    }
    setUploading(true);
    const ext = imageFile.name.split(".").pop();
    const path = `requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("requests").upload(path, imageFile, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("requests").getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  };

  const handlePublish = async () => {
    if (!title || !type || !category || !latitude || !longitude) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      const imageUrl = await uploadImage();
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, category, imageUrl, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const created = await res.json();
      toast({ title: "Posted!" });
      navigate(`/requests/${created.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create post", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <header className="sticky top-0 bg-background border-b border-border p-4 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold" data-testid="text-create-title">Create Post</h2>
          <Button onClick={handlePublish} disabled={uploading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90" data-testid="button-publish">
            {uploading ? "Uploading..." : "Publish"}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Title</Label>
            <Input placeholder="What do you need?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="help">Help</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Image</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Uploads to Supabase bucket "requests"</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Latitude</Label>
              <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="12.97" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Longitude</Label>
              <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="77.59" />
            </div>
          </div>
          <Button variant="outline" onClick={useMyLocation} className="gap-2 w-full">
            <MapPin className="w-4 h-4" /> Use my location
          </Button>
        </div>
      </div>
    </div>
  );
}
