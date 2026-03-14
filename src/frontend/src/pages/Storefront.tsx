import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ExternalLink,
  Heart,
  Loader2,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Offer } from "../backend";
import { SAMPLE_OFFERS } from "../data/sampleOffers";
import {
  useCreatePaymentSession,
  useListActiveOffers,
  useRecordClick,
} from "../hooks/useQueries";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PRESET_AMOUNTS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
];

function SupportSection() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const createSession = useCreatePaymentSession();

  const getAmountCents = (): number | null => {
    if (selectedPreset !== null) return selectedPreset;
    const parsed = Number.parseFloat(customAmount);
    if (!Number.isNaN(parsed) && parsed > 0) return Math.round(parsed * 100);
    return null;
  };

  const handleSupport = async () => {
    const cents = getAmountCents();
    if (!cents) {
      toast.error("Please select or enter an amount");
      return;
    }
    try {
      await createSession.mutateAsync({
        amountCents: BigInt(cents),
        currency: "usd",
        description: "Support AffiliatePilot",
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });
      toast.success("Opening payment page…");
    } catch (e) {
      toast.error(
        `Payment failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  return (
    <section
      className="container mx-auto px-4 pb-10"
      data-ocid="storefront.support.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="card-glass rounded-2xl p-8 max-w-2xl mx-auto text-center border border-primary/20"
        style={{ boxShadow: "0 0 40px oklch(var(--primary) / 0.08)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="h-6 w-6 text-primary fill-primary/30" />
          <h2 className="font-display text-2xl font-bold">Support This Site</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Enjoying the deals? A small tip keeps this platform running and adds
          new offers every week.
        </p>

        {/* Preset amounts */}
        <div className="flex justify-center gap-3 mb-4">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p.cents}
              type="button"
              onClick={() => {
                setSelectedPreset(p.cents);
                setCustomAmount("");
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                selectedPreset === p.cents
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex gap-3 max-w-xs mx-auto mb-5">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedPreset(null);
              }}
              className="pl-8 bg-secondary border-border focus:border-primary"
              data-ocid="storefront.support.amount_input"
            />
          </div>
        </div>

        <Button
          className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 glow-green font-semibold gap-2"
          disabled={createSession.isPending || getAmountCents() === null}
          onClick={handleSupport}
          data-ocid="storefront.support.submit_button"
        >
          {createSession.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              Support Now
              {getAmountCents()
                ? ` — $${(getAmountCents()! / 100).toFixed(2)}`
                : ""}
            </>
          )}
        </Button>

        {createSession.isPending && (
          <p
            className="text-xs text-muted-foreground mt-3"
            data-ocid="storefront.support.loading_state"
          >
            Creating secure payment session…
          </p>
        )}
      </motion.div>
    </section>
  );
}

function OfferCard({
  offer,
  index,
  isDemo,
}: {
  offer: Offer & { isDemo?: boolean };
  index: number;
  isDemo?: boolean;
}) {
  const recordClick = useRecordClick();

  const handleClick = () => {
    if (!isDemo) {
      recordClick.mutate(offer.id);
    }
    window.open(offer.affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col rounded-xl overflow-hidden card-glass hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
      }}
      data-ocid={`storefront.offer.item.${index + 1}`}
    >
      {isDemo && (
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant="outline"
            className="text-xs border-muted-foreground/40 text-muted-foreground bg-background/80 backdrop-blur-sm"
          >
            Demo
          </Badge>
        </div>
      )}
      {offer.featured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-primary text-primary-foreground text-xs gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        </div>
      )}

      <div className="relative h-44 overflow-hidden bg-muted">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid-noise flex items-center justify-center">
            <DollarSign className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-display font-semibold text-base leading-snug line-clamp-2">
          {offer.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {offer.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs border-border text-muted-foreground"
          >
            {offer.category}
          </Badge>
          <Badge className="text-xs bg-primary/15 text-primary border border-primary/30 gap-1">
            <TrendingUp className="h-3 w-3" />
            {offer.commissionRate}% commission
          </Badge>
        </div>
        <Button
          className="w-full mt-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-200 font-semibold group/btn"
          onClick={handleClick}
          data-ocid={`storefront.offer.button.${index + 1}`}
        >
          Get This Deal
          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden card-glass">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default function Storefront() {
  const { data: offers, isLoading } = useListActiveOffers();
  const [activeCategory, setActiveCategory] = useState("All");

  const displayOffers = (
    offers && offers.length > 0 ? offers : SAMPLE_OFFERS
  ) as (Offer & {
    isDemo?: boolean;
  })[];
  const usingDemo = !offers || offers.length === 0;

  const categories = [
    "All",
    ...Array.from(new Set(displayOffers.map((o) => o.category))),
  ];

  const featured = displayOffers.filter((o) => o.featured);
  const filtered =
    activeCategory === "All"
      ? displayOffers
      : displayOffers.filter((o) => o.category === activeCategory);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-affiliate.dim_1600x600.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative container mx-auto px-4 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30 gap-1.5 px-3 py-1">
              <Zap className="h-3 w-3" />
              Fully Automated Affiliate Engine
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="text-gradient-green">Affiliate</span>
              <span className="text-foreground">Pilot</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
              Deals that pay. Revenue on autopilot.{" "}
              <span className="text-foreground font-medium">
                Make money while you sleep.
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-8 mt-10"
          >
            {[
              {
                label: "Active Offers",
                value: displayOffers.filter((o) => o.active).length,
                icon: <Zap className="h-4 w-4" />,
              },
              {
                label: "Categories",
                value: categories.length - 1,
                icon: <Star className="h-4 w-4" />,
              },
              {
                label: "Avg Commission",
                value: `${Math.round(displayOffers.reduce((a, o) => a + o.commissionRate, 0) / (displayOffers.length || 1))}%`,
                icon: <TrendingUp className="h-4 w-4" />,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  {stat.icon}
                  <span className="font-display text-2xl font-bold">
                    {stat.value}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
              }`}
              data-ocid="storefront.category_filter.tab"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      {activeCategory === "All" && featured.length > 0 && (
        <section className="container mx-auto px-4 pb-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">Featured Deals</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featured.map((offer, i) => (
                <OfferCard
                  key={offer.id.toString()}
                  offer={offer}
                  index={i}
                  isDemo={
                    usingDemo &&
                    !!(offer as Offer & { isDemo?: boolean }).isDemo
                  }
                />
              ))}
            </motion.div>
          )}
        </section>
      )}

      {/* Support / Tip Jar Section */}
      <SupportSection />

      {/* All Offers */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-5">
          <DollarSign className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl font-bold">
            {activeCategory === "All" ? "All Offers" : activeCategory}
          </h2>
          <span className="text-muted-foreground text-sm ml-auto">
            {filtered.length} deals
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="storefront.offer.empty_state"
          >
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">
              No offers in this category yet
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((offer, i) => (
                <OfferCard
                  key={offer.id.toString()}
                  offer={offer}
                  index={i}
                  isDemo={
                    usingDemo &&
                    !!(offer as Offer & { isDemo?: boolean }).isDemo
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </main>
  );
}
