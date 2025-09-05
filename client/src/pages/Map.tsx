import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Map() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <header
        className="sticky top-0 z-40 bg-background border-b border-border transition-theme"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold" data-testid="text-map-title">Map</h2>
          <div className="w-8" />
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            title="map-view"
            src="https://www.openstreetmap.org/export/embed.html?layer=mapnik&zoom=12&marker=12.9716%2C77.5946"
            className="w-full h-[70vh]"
          />
        </div>
      </main>
    </div>
  );
}

export default Map;
