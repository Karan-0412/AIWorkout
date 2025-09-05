import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Map() {
  const [, navigate] = useLocation();

  return (
    <div className="fixed inset-0 bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
