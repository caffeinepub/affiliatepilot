import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Offer } from "../backend";
import { useActor } from "./useActor";

export function useListActiveOffers() {
  const { actor, isFetching } = useActor();
  return useQuery<Offer[]>({
    queryKey: ["activeOffers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOfferStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allOfferStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOfferStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalClicks() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalClicks"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalClicks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["totalEarnings"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordClick() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (offerId: bigint) => {
      if (!actor) return;
      await actor.recordClick(offerId);
    },
  });
}

export function useCreateOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      imageUrl: string;
      affiliateUrl: string;
      category: string;
      commissionRate: number;
      featured: boolean;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.createOffer(
        data.title,
        data.description,
        data.imageUrl,
        data.affiliateUrl,
        data.category,
        data.commissionRate,
        data.featured,
        data.active,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeOffers"] });
      qc.invalidateQueries({ queryKey: ["allOfferStats"] });
    },
  });
}

export function useUpdateOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      imageUrl: string;
      affiliateUrl: string;
      category: string;
      commissionRate: number;
      featured: boolean;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.updateOffer(
        data.id,
        data.title,
        data.description,
        data.imageUrl,
        data.affiliateUrl,
        data.category,
        data.commissionRate,
        data.featured,
        data.active,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeOffers"] });
      qc.invalidateQueries({ queryKey: ["allOfferStats"] });
    },
  });
}

export function useDeleteOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteOffer(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeOffers"] });
      qc.invalidateQueries({ queryKey: ["allOfferStats"] });
    },
  });
}

export function useLogEarning() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      offerId: bigint;
      amount: number;
      date: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.logEarning(data.offerId, data.amount, data.date, data.note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOfferStats"] });
      qc.invalidateQueries({ queryKey: ["totalEarnings"] });
    },
  });
}

export interface PaymentRecord {
  id: bigint;
  sessionId: string;
  amountCents: bigint;
  currency: string;
  description: string;
  status: string;
  timestamp: bigint;
}

export function useListPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRecord[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listPayments() as Promise<PaymentRecord[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePaymentSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      amountCents: bigint;
      currency: string;
      description: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const url = (await (actor as any).createPaymentSession(
        data.amountCents,
        data.currency,
        data.description,
        data.successUrl,
        data.cancelUrl,
      )) as string;
      window.open(url, "_blank", "noopener,noreferrer");
      return url;
    },
  });
}

export function useSetStripeSecretKey() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Not authenticated");
      await (actor as any).setStripeSecretKey(key);
    },
  });
}
