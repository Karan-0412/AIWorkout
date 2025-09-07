export default function Splash() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-primary">O</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">OfferShare</h1>
        <p className="text-sm text-muted-foreground mt-1">Loading…</p>
      </div>
    </div>
  );
}
