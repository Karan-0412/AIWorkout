import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
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

function markerIcon(type: string) {
  const color = type === "service" ? "#0079D3" : type === "product" ? "#16a34a" : "#ef4444";
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="${color}"/><circle cx="20" cy="20" r="3" fill="white"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(28, 28),
    anchor: new google.maps.Point(14, 14),
  } as google.maps.Icon;
}

export function Map() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<RequestItem | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const { data: requests } = useQuery<RequestItem[]>({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
  });

  const center = useMemo<google.maps.LatLngLiteral>(() => ({ lat: 12.9716, lng: 77.5946 }), []);
  const options = useMemo<google.maps.MapOptions>(
    () => ({
      mapId: undefined,
      disableDefaultUI: false,
      clickableIcons: true,
      gestureHandling: "greedy",
    }),
    []
  );

  return (
    <div className="fixed inset-0 bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Top overlay search */}
      <div className="fixed left-0 right-0 z-10 px-4 pt-3 space-y-3" style={{ top: 'env(safe-area-inset-top)' }}>
        <div className="bg-card border border-border rounded-xl shadow-md p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search places" className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm" />
        </div>
      </div>

      {isLoaded && (
        <GoogleMap
          center={center}
          zoom={12}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={options}
        >
          {(requests || []).map((r) => {
            const lat = typeof r.latitude === "string" ? parseFloat(r.latitude) : (r.latitude as number);
            const lng = typeof r.longitude === "string" ? parseFloat(r.longitude) : (r.longitude as number);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker
                key={r.id}
                position={{ lat, lng }}
                icon={markerIcon(r.type)}
                onClick={() => setSelected(r)}
              />
            );
          })}

          {selected && (
            <InfoWindow position={{ lat: Number(selected.latitude), lng: Number(selected.longitude) }} onCloseClick={() => setSelected(null)}>
              <div className="w-56">
                {selected.imageUrl && (
                  <img src={selected.imageUrl} alt={selected.title} className="w-full h-28 object-cover rounded-md mb-2" />
                )}
                <h3 className="font-semibold text-sm mb-1">{selected.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{selected.category}</p>
                <button
                  onClick={() => navigate(`/requests/${selected.id}`)}
                  className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

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
