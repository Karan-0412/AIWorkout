import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, X, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export function CreateOffer() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"offer" | "request">("offer");
  const [formData, setFormData] = useState({
    title: "",
    originalPrice: "",
    offerType: "",
    productLink: "",
    description: "",
    location: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  // Request form state
  const [reqTitle, setReqTitle] = useState("");
  const [reqType, setReqType] = useState(""); // service | product | help
  const [reqCategory, setReqCategory] = useState("");
  const [reqImageFile, setReqImageFile] = useState<File | null>(null);
  const [reqLatitude, setReqLatitude] = useState<string>("");
  const [reqLongitude, setReqLongitude] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageAdd = () => {
    // Mock image upload - in production, this would use Firebase Storage
    setImages(prev => [...prev, "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"]);
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSplitPrice = () => {
    const original = parseFloat(formData.originalPrice) || 0;
    switch (formData.offerType) {
      case "buy1get1":
        return (original / 2).toFixed(0);
      case "buy2get1":
        return (original / 3).toFixed(0);
      case "50percent":
        return (original * 0.75).toFixed(0);
      default:
        return (original / 2).toFixed(0);
    }
  };

  const handlePublishOffer = () => {
    if (!formData.title || !formData.originalPrice || !formData.offerType) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Offer published!", description: "Your offer is now live and users can join." });
    navigate("/");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReqLatitude(String(pos.coords.latitude));
        setReqLongitude(String(pos.coords.longitude));
      },
      () => toast({ title: "Failed to get location", variant: "destructive" })
    );
  };

  const uploadRequestImage = async (): Promise<string | undefined> => {
    if (!reqImageFile) return undefined;
    if (!supabase) {
      toast({ title: "Supabase not configured", description: "Connect Supabase and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", variant: "destructive" });
      throw new Error("Supabase not configured");
    }
    setUploading(true);
    const ext = reqImageFile.name.split(".").pop();
    const path = `requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("requests").upload(path, reqImageFile, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("requests").getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  };

  const handlePublishRequest = async () => {
    if (!reqTitle || !reqType || !reqCategory || !reqLatitude || !reqLongitude) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      const imageUrl = await uploadRequestImage();
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: reqTitle, type: reqType, category: reqCategory, imageUrl, latitude: parseFloat(reqLatitude), longitude: parseFloat(reqLongitude) }),
      });
      if (!res.ok) throw new Error("Failed to create request");
      const created = await res.json();
      toast({ title: "Request published!" });
      navigate(`/requests/${created.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create request", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b border-border p-4 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold" data-testid="text-create-title">Create Offer</h2>
          <Button
            onClick={() => (activeTab === "offer" ? handlePublishOffer() : handlePublishRequest())}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            data-testid="button-publish"
            disabled={activeTab === "request" && uploading}
          >
            {activeTab === "request" && uploading ? "Uploading..." : "Publish"}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="offer">Offer</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
          </TabsList>

          <TabsContent value="offer" className="space-y-6">
            {/* Product Images */}
            <div>
          <Label className="text-sm font-medium mb-3 block">Product Images</Label>
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={handleImageAdd}
              className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              data-testid="button-add-image"
            >
              <div className="text-center">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Add Photo</p>
              </div>
            </div>
            {images.map((image, index) => (
              <div key={index} className="aspect-square border border-border rounded-lg relative overflow-hidden">
                <img src={image} alt="Product" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  data-testid={`button-remove-image-${index}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">Product Name</Label>
            <Input
              id="title"
              placeholder="e.g., Sony WH-1000XM4 Headphones"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              data-testid="input-title"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium mb-2 block">Original Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="24999"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange("originalPrice", e.target.value)}
              data-testid="input-price"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Offer Type</Label>
            <Select value={formData.offerType} onValueChange={(value) => handleInputChange("offerType", value)}>
              <SelectTrigger data-testid="select-offer-type">
                <SelectValue placeholder="Select offer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy1get1">Buy 1 Get 1 Free</SelectItem>
                <SelectItem value="buy2get1">Buy 2 Get 1 Free</SelectItem>
                <SelectItem value="50percent">50% Off on 2nd Item</SelectItem>
                <SelectItem value="custom">Custom Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="productLink" className="text-sm font-medium mb-2 block">Product Link (Optional)</Label>
            <Input
              id="productLink"
              type="url"
              placeholder="https://amazon.in/product-link"
              value={formData.productLink}
              onChange={(e) => handleInputChange("productLink", e.target.value)}
              className="focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              data-testid="input-product-link"
            />
            <p className="text-xs text-muted-foreground mt-1">
              📦 Add link from Amazon, Flipkart, etc. for easy shopping
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describe the offer, pickup/delivery details..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="resize-none"
              data-testid="textarea-description"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">Location</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                placeholder="Koramangala, Bangalore"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="flex-1"
                data-testid="input-location"
              />
              <Button variant="outline" size="sm" className="px-4" data-testid="button-get-location">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

            {/* Preview */}
            {formData.originalPrice && formData.offerType && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Preview</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold" data-testid="text-preview-split">
                          Split Cost: ₹{calculateSplitPrice()} each
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid="text-preview-original">
                          Original: ₹{formData.originalPrice}
                        </p>
                      </div>
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        {formData.offerType === "buy1get1" && "Buy 1 Get 1 Free"}
                        {formData.offerType === "buy2get1" && "Buy 2 Get 1 Free"}
                        {formData.offerType === "50percent" && "50% Off 2nd Item"}
                        {formData.offerType === "custom" && "Custom Offer"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="request" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Title</Label>
                <Input placeholder="What do you need?" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Type</Label>
                <Select value={reqType} onValueChange={setReqType}>
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
                <Select value={reqCategory} onValueChange={setReqCategory}>
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
                  <Input type="file" accept="image/*" onChange={(e) => setReqImageFile(e.target.files?.[0] || null)} />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Uploads to Supabase bucket "requests"</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Latitude</Label>
                  <Input value={reqLatitude} onChange={(e) => setReqLatitude(e.target.value)} placeholder="12.97" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Longitude</Label>
                  <Input value={reqLongitude} onChange={(e) => setReqLongitude(e.target.value)} placeholder="77.59" />
                </div>
              </div>
              <Button variant="outline" onClick={useMyLocation} className="gap-2 w-full">
                <MapPin className="w-4 h-4" /> Use my location
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
