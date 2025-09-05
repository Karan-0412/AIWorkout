import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Map() {
  const [, _navigate] = useLocation();

  return (
    <div className="fixed inset-0 bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Top overlay search */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-3 space-y-3">
        <div className="bg-card/95 border border-border rounded-xl shadow-md p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search places" className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm" />
        </div>
      </div>

      {/* Map behind */}
      <iframe
        title="map-view"
        src="https://www.google.com/maps?q=12.9716,77.5946&z=12&output=embed"
        className="w-full h-full"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default Map;
