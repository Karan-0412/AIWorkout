import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequestItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  imageUrl?: string | null;
  latitude: string | number;
  longitude: string | number;
};

export default function RequestDetails() {
  const [, params] = useRoute("/requests/:id");
  const [, navigate] = useLocation();
  const [data, setData] = useState<RequestItem | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/requests/${params?.id}`);
      if (res.ok) {
        setData(await res.json());
      }
    })();
  }, [params?.id]);

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <header className="sticky top-0 bg-background border-b border-border p-4 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">Request Details</h2>
        </div>
      </header>

      {data && (
        <div className="p-4 space-y-4">
          {data.imageUrl && (
            <img src={data.imageUrl} alt={data.title} className="w-full h-56 object-cover rounded-lg" />
          )}
          <div>
            <h1 className="text-xl font-bold">{data.title}</h1>
            <p className="text-sm text-muted-foreground">{data.type} • {data.category}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Location: {typeof data.latitude === 'string' ? data.latitude : data.latitude.toFixed(5)}, {typeof data.longitude === 'string' ? data.longitude : data.longitude.toFixed(5)}
          </div>
        </div>
      )}
    </div>
  );
}
