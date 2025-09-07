import { useMemo } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";

type RequestItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  imageUrl?: string | null;
  latitude: string | number;
  longitude: string | number;
};

function getIconByType(type: string) {
  const color = type === "service" ? "#0079D3" : type === "product" ? "#16a34a" : "#ef4444";
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};box-shadow:0 2px 6px rgba(0,0,0,0.3);color:#fff;font-weight:700;font-size:14px;">•</div>`;
  return L.divIcon({ html, className: "", iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14] });
}

export function Map() {
  const [, navigate] = useLocation();

  const { data: requests } = useQuery<RequestItem[]>({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
  });

  const center = useMemo<[number, number]>(() => [12.9716, 77.5946], []);

  return (
    <div className="fixed inset-0 bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Top overlay search */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-3 space-y-3">
        <div className="bg-card border border-border rounded-xl shadow-md p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search places" className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm" />
        </div>
      </div>

      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(requests || []).map((r) => {
          const lat = typeof r.latitude === "string" ? parseFloat(r.latitude) : (r.latitude as number);
          const lng = typeof r.longitude === "string" ? parseFloat(r.longitude) : (r.longitude as number);
          if (isNaN(lat) || isNaN(lng)) return null;
          return (
            <Marker key={r.id} position={[lat, lng]} icon={getIconByType(r.type)}>
              <Popup>
                <div className="w-56">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.title} className="w-full h-28 object-cover rounded-md mb-2" />
                  )}
                  <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{r.category}</p>
                  <button
                    onClick={() => navigate(`/requests/${r.id}`)}
                    className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <button
        onClick={() => navigate('/create')}
        className="absolute bottom-4 right-4 z-20 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        New Request
      </button>
    </div>
  );
}

export default Map;
