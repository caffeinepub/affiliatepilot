import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { Offer } from "../backend";

interface EarningsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offers: Offer[];
  onSubmit: (data: {
    offerId: bigint;
    amount: number;
    date: string;
    note: string;
  }) => Promise<void>;
  isPending: boolean;
}

export function EarningsForm({
  open,
  onOpenChange,
  offers,
  onSubmit,
  isPending,
}: EarningsFormProps) {
  const [offerId, setOfferId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerId) return;
    await onSubmit({
      offerId: BigInt(offerId),
      amount: Number.parseFloat(amount),
      date,
      note,
    });
    setOfferId("");
    setAmount("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Log Earning
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-1.5">
            <Label>Offer</Label>
            <Select value={offerId} onValueChange={setOfferId} required>
              <SelectTrigger data-ocid="admin.earnings.form.select">
                <SelectValue placeholder="Select an offer" />
              </SelectTrigger>
              <SelectContent>
                {offers.map((o) => (
                  <SelectItem key={o.id.toString()} value={o.id.toString()}>
                    {o.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="earn-date">Date</Label>
              <Input
                id="earn-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Payout from November campaign"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !offerId || !amount}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green font-semibold"
            data-ocid="admin.earnings.form.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              "Log Earning"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
