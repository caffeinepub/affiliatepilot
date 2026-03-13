import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Offer } from "../backend";

interface OfferFormData {
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  commissionRate: number;
  featured: boolean;
  active: boolean;
}

interface OfferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editOffer?: Offer | null;
  onSubmit: (data: OfferFormData) => Promise<void>;
  isPending: boolean;
}

const defaultForm: OfferFormData = {
  title: "",
  description: "",
  imageUrl: "",
  affiliateUrl: "",
  category: "",
  commissionRate: 10,
  featured: false,
  active: true,
};

export function OfferForm({
  open,
  onOpenChange,
  editOffer,
  onSubmit,
  isPending,
}: OfferFormProps) {
  const [form, setForm] = useState<OfferFormData>(defaultForm);

  useEffect(() => {
    if (editOffer) {
      setForm({
        title: editOffer.title,
        description: editOffer.description,
        imageUrl: editOffer.imageUrl,
        affiliateUrl: editOffer.affiliateUrl,
        category: editOffer.category,
        commissionRate: editOffer.commissionRate,
        featured: editOffer.featured,
        active: editOffer.active,
      });
    } else if (!open) {
      setForm(defaultForm);
    }
  }, [editOffer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    if (!isPending) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            {editOffer ? "Edit Offer" : "Add New Offer"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. NordVPN Premium Plan"
              required
              data-ocid="admin.offer.form.title.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the product or service..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="affiliateUrl">Affiliate URL</Label>
            <Input
              id="affiliateUrl"
              value={form.affiliateUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, affiliateUrl: e.target.value }))
              }
              placeholder="https://..."
              type="url"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Software"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={form.commissionRate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    commissionRate: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm((p) => ({ ...p, featured: v }))}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-green font-semibold"
            data-ocid="admin.offer.form.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editOffer ? (
              "Update Offer"
            ) : (
              "Create Offer"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
