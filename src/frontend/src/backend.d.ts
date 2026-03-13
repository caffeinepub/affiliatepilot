import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Offer {
    id: bigint;
    title: string;
    featured: boolean;
    active: boolean;
    description: string;
    affiliateUrl: string;
    imageUrl: string;
    category: string;
    commissionRate: number;
}
export interface OfferStats {
    offer: Offer;
    clickCount: bigint;
    totalEarnings: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOffer(title: string, description: string, imageUrl: string, affiliateUrl: string, category: string, commissionRate: number, featured: boolean, active: boolean): Promise<void>;
    deleteOffer(id: bigint): Promise<void>;
    getAllOfferStats(): Promise<Array<OfferStats>>;
    getCallerUserRole(): Promise<UserRole>;
    getClickCount(offerId: bigint): Promise<bigint>;
    getOfferById(id: bigint): Promise<Offer | null>;
    getOfferStats(offerId: bigint): Promise<OfferStats>;
    getTotalClicks(): Promise<bigint>;
    getTotalEarnings(): Promise<number>;
    isCallerAdmin(): Promise<boolean>;
    listActiveOffers(): Promise<Array<Offer>>;
    logEarning(offerId: bigint, amount: number, date: string, note: string): Promise<void>;
    recordClick(offerId: bigint): Promise<void>;
    updateOffer(id: bigint, title: string, description: string, imageUrl: string, affiliateUrl: string, category: string, commissionRate: number, featured: boolean, active: boolean): Promise<void>;
}
