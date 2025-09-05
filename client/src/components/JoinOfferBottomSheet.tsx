import { useState } from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JoinOfferBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: {
    id: string;
    title: string;
    originalPrice: string;
    splitPrice: string;
  };
  onConfirm: (offerId: string, paymentMethod: string) => void;
}

export function JoinOfferBottomSheet({ isOpen, onClose, offer, onConfirm }: JoinOfferBottomSheetProps) {
  const [paymentMethod, setPaymentMethod] = useState("upi");

  if (!isOpen || !offer) return null;

  const originalPrice = parseFloat(offer.originalPrice);
  const splitPrice = parseFloat(offer.splitPrice);
  const savings = originalPrice - splitPrice;

  const handleConfirm = () => {
    onConfirm(offer.id, paymentMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" data-testid="join-bottom-sheet">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card dark:bg-card rounded-t-2xl p-6 slide-up shadow-2xl border-t border-border" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" data-testid="text-join-title">Join this offer</h3>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-sheet">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Original Price</span>
            <span className="font-semibold" data-testid="text-original-price">₹{offer.originalPrice}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Share (50%)</span>
            <span className="font-bold text-primary" data-testid="text-split-price">₹{offer.splitPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Savings</span>
            <span className="font-semibold text-green-500" data-testid="text-savings">₹{savings.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger data-testid="select-payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI Payment</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-800 dark:text-yellow-200" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Payment will be coordinated after matching with another user.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl py-3 hover:bg-accent/10 transition-colors"
            data-testid="button-cancel-join"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            data-testid="button-confirm-join"
          >
            Request to Join
          </Button>
        </div>
      </div>
    </div>
  );
}
