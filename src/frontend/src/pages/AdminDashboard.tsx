import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CheckCircle,
  CreditCard,
  DollarSign,
  KeyRound,
  Loader2,
  MousePointerClick,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Offer } from "../backend";
import { EarningsForm } from "../components/EarningsForm";
import { OfferForm } from "../components/OfferForm";
import {
  useAllOfferStats,
  useCreateOffer,
  useDeleteOffer,
  useListPayments,
  useLogEarning,
  useSetStripeSecretKey,
  useTotalClicks,
  useTotalEarnings,
  useUpdateOffer,
} from "../hooks/useQueries";

function StatCard({
  label,
  value,
  icon,
  className,
  ocid,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  ocid: string;
  isLoading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card-glass rounded-xl p-6 flex items-center gap-4 ${className ?? ""}`}
      data-ocid={ocid}
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="h-7 w-24 mt-1" />
        ) : (
          <p className="font-display text-2xl font-bold">{value}</p>
        )}
      </div>
    </motion.div>
  );
}

const SKELETON_ROWS_4 = ["s1", "s2", "s3", "s4"];
const SKELETON_COLS_8 = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const SKELETON_COLS_4 = ["c1", "c2", "c3", "c4"];
const SKELETON_COLS_5 = ["c1", "c2", "c3", "c4", "c5"];

function PaymentsTab() {
  const { data: payments, isLoading: paymentsLoading } = useListPayments();
  const setStripeKey = useSetStripeSecretKey();
  const [stripeKey, setStripeKeyValue] = useState("");

  const handleSaveKey = async () => {
    if (!stripeKey.trim()) {
      toast.error("Please enter your Stripe secret key");
      return;
    }
    try {
      await setStripeKey.mutateAsync(stripeKey.trim());
      toast.success("Stripe secret key saved!");
      setStripeKeyValue("");
    } catch (e) {
      toast.error(
        `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const formatAmount = (cents: bigint, currency: string) => {
    const amount = Number(cents) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (timestamp: bigint) => {
    // Motoko timestamps are in nanoseconds
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "complete":
      case "paid":
        return "bg-primary/15 text-primary border-primary/30";
      case "pending":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      case "failed":
      case "expired":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stripe Key Settings */}
      <div className="card-glass rounded-xl p-6 border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">
            Stripe Configuration
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your Stripe Secret Key (starts with{" "}
          <code className="bg-secondary px-1 rounded text-xs">sk_live_</code> or{" "}
          <code className="bg-secondary px-1 rounded text-xs">sk_test_</code>)
          to enable payment processing.
        </p>
        <div className="flex gap-3 max-w-lg">
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="stripe-key"
              className="text-xs text-muted-foreground"
            >
              Secret Key
            </Label>
            <Input
              id="stripe-key"
              type="password"
              placeholder="sk_live_..."
              value={stripeKey}
              onChange={(e) => setStripeKeyValue(e.target.value)}
              className="bg-secondary border-border font-mono text-sm"
              data-ocid="admin.stripe_key.input"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              onClick={handleSaveKey}
              disabled={setStripeKey.isPending || !stripeKey.trim()}
              data-ocid="admin.stripe_key.save_button"
            >
              {setStripeKey.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Save Key
            </Button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-accent" />
          <h3 className="font-display text-lg font-semibold">
            Payment History
          </h3>
          {!paymentsLoading && payments && (
            <span className="text-xs text-muted-foreground ml-auto">
              {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div
          className="card-glass rounded-xl overflow-hidden"
          data-ocid="admin.payments.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsLoading ? (
                SKELETON_ROWS_4.map((rowId) => (
                  <TableRow key={rowId} className="border-border">
                    {SKELETON_COLS_5.map((colId) => (
                      <TableCell key={colId}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payments && payments.length > 0 ? (
                payments.map((p, i) => (
                  <TableRow
                    key={p.id.toString()}
                    className="border-border hover:bg-secondary/30"
                    data-ocid={`admin.payments.row.${i + 1}`}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(p.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.description}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatAmount(p.amountCents, p.currency)}
                    </TableCell>
                    <TableCell>
                      <span className="uppercase text-xs font-mono text-muted-foreground">
                        {p.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs capitalize ${statusColor(p.status)}`}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="admin.payments.empty_state"
                  >
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No payments received yet.</p>
                    <p className="text-xs mt-1">
                      Payments will appear here once visitors support your site.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAllOfferStats();
  const { data: totalClicks, isLoading: clicksLoading } = useTotalClicks();
  const { data: totalEarnings, isLoading: earningsLoading } =
    useTotalEarnings();

  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();
  const logEarning = useLogEarning();

  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [earningsFormOpen, setEarningsFormOpen] = useState(false);

  const offers = stats?.map((s) => s.offer) ?? [];
  const activeCount = offers.filter((o) => o.active).length;

  const handleOfferSubmit = async (data: {
    title: string;
    description: string;
    imageUrl: string;
    affiliateUrl: string;
    category: string;
    commissionRate: number;
    featured: boolean;
    active: boolean;
  }) => {
    try {
      if (editOffer) {
        await updateOffer.mutateAsync({ ...data, id: editOffer.id });
        toast.success("Offer updated successfully");
      } else {
        await createOffer.mutateAsync(data);
        toast.success("Offer created successfully");
      }
      setOfferFormOpen(false);
      setEditOffer(null);
    } catch (e) {
      toast.error(
        `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteOffer.mutateAsync(id);
      toast.success("Offer deleted");
    } catch (e) {
      toast.error(
        `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleLogEarning = async (data: {
    offerId: bigint;
    amount: number;
    date: string;
    note: string;
  }) => {
    try {
      await logEarning.mutateAsync(data);
      toast.success(`$${data.amount.toFixed(2)} earning logged!`);
    } catch (e) {
      toast.error(
        `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="text-gradient-green">Affiliate</span> Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Your money-making machine, automated
        </p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Offers"
          value={activeCount}
          icon={<Star className="h-6 w-6 text-yellow-400" />}
          ocid="admin.stats.active_offers.card"
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Offers"
          value={offers.length}
          icon={<BarChart3 className="h-6 w-6 text-accent" />}
          ocid="admin.stats.total_offers.card"
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Clicks"
          value={
            clicksLoading ? "—" : Number(totalClicks ?? 0).toLocaleString()
          }
          icon={<MousePointerClick className="h-6 w-6 text-accent" />}
          className="border-l-2 border-accent"
          ocid="admin.stats.total_clicks.card"
          isLoading={clicksLoading}
        />
        <StatCard
          label="Total Earnings"
          value={earningsLoading ? "—" : `$${(totalEarnings ?? 0).toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          className="border-l-2 border-primary"
          ocid="admin.stats.total_earnings.card"
          isLoading={earningsLoading}
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="offers">
        <TabsList className="bg-secondary border border-border mb-6">
          <TabsTrigger value="offers" data-ocid="admin.offers.tab">
            Offers
          </TabsTrigger>
          <TabsTrigger value="analytics" data-ocid="admin.analytics.tab">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="earnings" data-ocid="admin.earnings.tab">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="admin.payments.tab">
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Offers Tab */}
        <TabsContent value="offers">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Manage Offers
            </h2>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green gap-1.5"
              onClick={() => {
                setEditOffer(null);
                setOfferFormOpen(true);
              }}
              data-ocid="admin.add_offer.button"
            >
              <Plus className="h-4 w-4" />
              Add Offer
            </Button>
          </div>

          <div className="card-glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsLoading ? (
                  SKELETON_ROWS_4.map((rowId) => (
                    <TableRow key={rowId} className="border-border">
                      {SKELETON_COLS_8.map((colId) => (
                        <TableCell key={colId}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : stats && stats.length > 0 ? (
                  stats.map((s, i) => (
                    <TableRow
                      key={s.offer.id.toString()}
                      className="border-border hover:bg-secondary/30"
                      data-ocid={`admin.offer.row.${i + 1}`}
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {s.offer.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {s.offer.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-primary font-semibold">
                          {s.offer.commissionRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.offer.featured ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        {s.offer.active ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-accent">
                        {Number(s.clickCount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        ${s.totalEarnings.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-secondary"
                            onClick={() => {
                              setEditOffer(s.offer);
                              setOfferFormOpen(true);
                            }}
                            data-ocid={`admin.offer.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                                data-ocid={`admin.offer.delete_button.${i + 1}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Offer?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete &quot;
                                  {s.offer.title}&quot;. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.offer.delete.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDelete(s.offer.id)}
                                  data-ocid="admin.offer.delete.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="admin.offers.empty_state"
                    >
                      No offers yet. Click &quot;Add Offer&quot; to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-glass rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Clicks
              </p>
              <p className="font-display text-3xl font-bold text-accent mt-1">
                {clicksLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  Number(totalClicks ?? 0).toLocaleString()
                )}
              </p>
            </div>
            <div className="card-glass rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Earnings
              </p>
              <p className="font-display text-3xl font-bold text-primary mt-1">
                {earningsLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  `$${(totalEarnings ?? 0).toFixed(2)}`
                )}
              </p>
            </div>
            <div className="card-glass rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Active Offers
              </p>
              <p className="font-display text-3xl font-bold mt-1">
                {activeCount}
              </p>
            </div>
          </div>

          <h3 className="font-display text-lg font-semibold mb-4">
            Offer Performance
          </h3>
          <div className="card-glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Offer</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsLoading ? (
                  SKELETON_ROWS_4.map((rowId) => (
                    <TableRow key={rowId} className="border-border">
                      {SKELETON_COLS_4.map((colId) => (
                        <TableCell key={colId}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : stats && stats.length > 0 ? (
                  [...(stats ?? [])]
                    .sort((a, b) => Number(b.clickCount) - Number(a.clickCount))
                    .map((s) => (
                      <TableRow
                        key={s.offer.id.toString()}
                        className="border-border hover:bg-secondary/30"
                      >
                        <TableCell className="font-medium">
                          {s.offer.title}
                        </TableCell>
                        <TableCell className="text-right font-mono text-accent">
                          {Number(s.clickCount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          ${s.totalEarnings.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-primary/15 text-primary border-primary/30">
                            {s.offer.commissionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No data yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Earnings Log
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track your affiliate commissions
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green gap-1.5"
              onClick={() => setEarningsFormOpen(true)}
              data-ocid="admin.earnings.log_button"
            >
              <Plus className="h-4 w-4" />
              Log Earning
            </Button>
          </div>

          <div className="card-glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Offer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Clicks</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead className="text-right">Commission Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsLoading ? (
                  SKELETON_ROWS_4.map((rowId) => (
                    <TableRow key={rowId} className="border-border">
                      {SKELETON_COLS_5.map((colId) => (
                        <TableCell key={colId}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : stats && stats.length > 0 ? (
                  stats.map((s, i) => (
                    <TableRow
                      key={s.offer.id.toString()}
                      className="border-border hover:bg-secondary/30"
                      data-ocid={`admin.earnings.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {s.offer.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {s.offer.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-accent">
                        {Number(s.clickCount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        ${s.totalEarnings.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-primary">
                          {s.offer.commissionRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="admin.earnings.empty_state"
                    >
                      No earnings logged yet. Start tracking your commissions!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="card-glass rounded-xl px-6 py-4 flex items-center gap-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Logged Earnings
                  </p>
                  <p className="font-display text-xl font-bold text-primary">
                    ${(totalEarnings ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
      </Tabs>

      <OfferForm
        open={offerFormOpen}
        onOpenChange={(v) => {
          setOfferFormOpen(v);
          if (!v) setEditOffer(null);
        }}
        editOffer={editOffer}
        onSubmit={handleOfferSubmit}
        isPending={createOffer.isPending || updateOffer.isPending}
      />

      <EarningsForm
        open={earningsFormOpen}
        onOpenChange={setEarningsFormOpen}
        offers={offers}
        onSubmit={handleLogEarning}
        isPending={logEarning.isPending}
      />
    </main>
  );
}
