import Map "mo:core/Map";
import Time "mo:core/Time";
import Float "mo:core/Float";
import List "mo:core/List";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Offer = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    affiliateUrl : Text;
    category : Text;
    commissionRate : Float;
    featured : Bool;
    active : Bool;
  };

  public type ClickEvent = {
    offerId : Nat;
    timestamp : Time.Time;
  };

  public type EarningsLog = {
    offerId : Nat;
    amount : Float;
    date : Text;
    note : Text;
  };

  public type OfferStats = {
    offer : Offer;
    clickCount : Nat;
    totalEarnings : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  module OfferStats {
    public func compare(stats1 : OfferStats, stats2 : OfferStats) : Order.Order {
      Int.compare(stats1.offer.id, stats2.offer.id);
    };
  };

  // State
  var nextOfferId = 1;
  let offers = Map.empty<Nat, Offer>();
  let clicks = Map.empty<Nat, Nat>();
  let earnings = Map.empty<Nat, List.List<EarningsLog>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Admin-only: Offer Management
  public shared ({ caller }) func createOffer(
    title : Text,
    description : Text,
    imageUrl : Text,
    affiliateUrl : Text,
    category : Text,
    commissionRate : Float,
    featured : Bool,
    active : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create offers");
    };
    let offer : Offer = {
      id = nextOfferId;
      title;
      description;
      imageUrl;
      affiliateUrl;
      category;
      commissionRate;
      featured;
      active;
    };
    offers.add(nextOfferId, offer);
    nextOfferId += 1;
  };

  public shared ({ caller }) func updateOffer(
    id : Nat,
    title : Text,
    description : Text,
    imageUrl : Text,
    affiliateUrl : Text,
    category : Text,
    commissionRate : Float,
    featured : Bool,
    active : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update offers");
    };
    let offer : Offer = {
      id;
      title;
      description;
      imageUrl;
      affiliateUrl;
      category;
      commissionRate;
      featured;
      active;
    };
    offers.add(id, offer);
  };

  public shared ({ caller }) func deleteOffer(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete offers");
    };
    if (not offers.containsKey(id)) {
      Runtime.trap("Offer does not exist.");
    };
    offers.remove(id);
    clicks.remove(id);
    earnings.remove(id);
  };

  // Public: List active offers (no auth required)
  public query ({ caller }) func listActiveOffers() : async [Offer] {
    offers.values().toArray().filter(
      func(offer) { offer.active }
    );
  };

  // Public: Get offer by ID (no auth required)
  public query ({ caller }) func getOfferById(id : Nat) : async ?Offer {
    offers.get(id);
  };

  // Public: Record click (no auth required - anyone can trigger)
  public shared ({ caller }) func recordClick(offerId : Nat) : async () {
    switch (offers.get(offerId)) {
      case (null) {
        Runtime.trap("Offer does not exist");
      };
      case (?_) {
        let currentClicks = switch (clicks.get(offerId)) {
          case (null) { 0 };
          case (?count) { count };
        };
        clicks.add(offerId, currentClicks + 1);
      };
    };
  };

  // Admin-only: Log earnings
  public shared ({ caller }) func logEarning(offerId : Nat, amount : Float, date : Text, note : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can log earnings");
    };
    switch (offers.get(offerId)) {
      case (null) {
        Runtime.trap("Offer does not exist");
      };
      case (?_) {
        let log : EarningsLog = {
          offerId;
          amount;
          date;
          note;
        };
        let existing = switch (earnings.get(offerId)) {
          case (null) { List.empty<EarningsLog>() };
          case (?list) { list };
        };
        existing.add(log);
        earnings.add(offerId, existing);
      };
    };
  };

  // Public: Get stats for a specific offer (no auth required)
  public query ({ caller }) func getOfferStats(offerId : Nat) : async OfferStats {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist.") };
      case (?offer) {
        let clickCount = switch (clicks.get(offerId)) {
          case (null) { 0 };
          case (?count) { count };
        };
        let totalEarnings = switch (earnings.get(offerId)) {
          case (null) { 0.0 };
          case (?logs) {
            logs.foldLeft(
              0.0,
              func(acc, log) { acc + log.amount },
            );
          };
        };
        {
          offer;
          clickCount;
          totalEarnings;
        };
      };
    };
  };

  // Public: Get all offer stats (no auth required)
  public query ({ caller }) func getAllOfferStats() : async [OfferStats] {
    offers.toArray().map(func((_, offer)) { getOfferStatsInternal(offer.id) }).sort();
  };

  func getOfferStatsInternal(offerId : Nat) : OfferStats {
    switch (offers.get(offerId)) {
      case (null) {
        Runtime.trap("Offer does not exist");
      };
      case (?offer) {
        let clickCount = switch (clicks.get(offerId)) {
          case (null) { 0 };
          case (?count) { count };
        };
        let totalEarnings = switch (earnings.get(offerId)) {
          case (null) { 0.0 };
          case (?logs) {
            logs.foldLeft(
              0.0,
              func(acc, log) { acc + log.amount },
            );
          };
        };
        {
          offer;
          clickCount;
          totalEarnings;
        };
      };
    };
  };

  // Public: Get click count for an offer (no auth required)
  public query ({ caller }) func getClickCount(offerId : Nat) : async Nat {
    switch (offers.get(offerId)) {
      case (null) {
        Runtime.trap("Offer does not exist");
      };
      case (?_) {
        switch (clicks.get(offerId)) {
          case (null) { 0 };
          case (?count) { count };
        };
      };
    };
  };

  // Public: Get total clicks across all offers (no auth required)
  public query ({ caller }) func getTotalClicks() : async Nat {
    clicks.values().toArray().foldLeft(0, Nat.add);
  };

  // Public: Get total earnings across all offers (no auth required)
  public query ({ caller }) func getTotalEarnings() : async Float {
    earnings.values().toArray().foldLeft(
      0.0,
      func(acc, logs) {
        acc + logs.toArray().foldLeft(0.0, func(innerAcc, log) { innerAcc + log.amount });
      },
    );
  };

  // Authorization checks & profile functions are now part of MixinAuthorization
};
