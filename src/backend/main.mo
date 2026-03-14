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
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

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

  public type PaymentRecord = {
    id : Nat;
    sessionId : Text;
    amountCents : Nat;
    currency : Text;
    description : Text;
    status : Text;
    timestamp : Time.Time;
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
  var nextPaymentId = 1;
  let offers = Map.empty<Nat, Offer>();
  let clicks = Map.empty<Nat, Nat>();
  let earnings = Map.empty<Nat, List.List<EarningsLog>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let payments = Map.empty<Nat, PaymentRecord>();

  // Stripe config
  var stripeSecretKey : Text = "";

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Transform for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Admin: Set Stripe secret key
  public shared ({ caller }) func setStripeSecretKey(key : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    stripeSecretKey := key;
  };

  // Public: Create Stripe checkout session for a support payment
  public shared ({ caller }) func createPaymentSession(amountCents : Nat, currency : Text, description : Text, successUrl : Text, cancelUrl : Text) : async Text {
    if (stripeSecretKey == "") {
      Runtime.trap("Stripe not configured");
    };
    let config : Stripe.StripeConfiguration = {
      secretKey = stripeSecretKey;
      allowedCountries = [];
    };
    let item : Stripe.ShoppingItem = {
      currency;
      productName = description;
      productDescription = description;
      priceInCents = amountCents;
      quantity = 1;
    };
    let sessionJson = await Stripe.createCheckoutSession(config, caller, [item], successUrl, cancelUrl, transform);
    // Extract session URL from JSON response
    let urlPattern = "\"url\":\"";
    if (sessionJson.contains(#text urlPattern)) {
      let parts = sessionJson.split(#text urlPattern);
      switch (parts.next()) {
        case (null) { Runtime.trap("Failed to parse session") };
        case (?_) {
          switch (parts.next()) {
            case (?afterPattern) {
              switch (afterPattern.split(#text "\"").next()) {
                case (?url) {
                  // Record pending payment
                  let sessionId = extractSessionId(sessionJson);
                  let record : PaymentRecord = {
                    id = nextPaymentId;
                    sessionId;
                    amountCents;
                    currency;
                    description;
                    status = "pending";
                    timestamp = Time.now();
                  };
                  payments.add(nextPaymentId, record);
                  nextPaymentId += 1;
                  return url;
                };
                case (null) { Runtime.trap("Failed to parse URL") };
              };
            };
            case (null) { Runtime.trap("Failed to parse session response") };
          };
        };
      };
    };
    Runtime.trap("Stripe error: " # sessionJson);
  };

  func extractSessionId(json : Text) : Text {
    let pattern = "\"id\":\"cs_";
    if (json.contains(#text pattern)) {
      let parts = json.split(#text pattern);
      switch (parts.next()) {
        case (null) { "" };
        case (?_) {
          switch (parts.next()) {
            case (?after) {
              switch (after.split(#text "\"").next()) {
                case (?id) { "cs_" # id };
                case (null) { "" };
              };
            };
            case (null) { "" };
          };
        };
      };
    } else { "" };
  };

  // Admin: List all payments
  public shared query ({ caller }) func listPayments() : async [PaymentRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    payments.values().toArray();
  };

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

  public query ({ caller }) func listActiveOffers() : async [Offer] {
    offers.values().toArray().filter(
      func(offer) { offer.active }
    );
  };

  public query ({ caller }) func getOfferById(id : Nat) : async ?Offer {
    offers.get(id);
  };

  public shared ({ caller }) func recordClick(offerId : Nat) : async () {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist") };
      case (?_) {
        let currentClicks = switch (clicks.get(offerId)) {
          case (null) { 0 };
          case (?count) { count };
        };
        clicks.add(offerId, currentClicks + 1);
      };
    };
  };

  public shared ({ caller }) func logEarning(offerId : Nat, amount : Float, date : Text, note : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can log earnings");
    };
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist") };
      case (?_) {
        let log : EarningsLog = { offerId; amount; date; note };
        let existing = switch (earnings.get(offerId)) {
          case (null) { List.empty<EarningsLog>() };
          case (?list) { list };
        };
        existing.add(log);
        earnings.add(offerId, existing);
      };
    };
  };

  public query ({ caller }) func getOfferStats(offerId : Nat) : async OfferStats {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist.") };
      case (?offer) {
        {
          offer;
          clickCount = switch (clicks.get(offerId)) { case (null) { 0 }; case (?c) { c } };
          totalEarnings = switch (earnings.get(offerId)) {
            case (null) { 0.0 };
            case (?logs) { logs.foldLeft(0.0, func(acc, log) { acc + log.amount }) };
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllOfferStats() : async [OfferStats] {
    offers.toArray().map(func((_, offer)) { getOfferStatsInternal(offer.id) }).sort();
  };

  func getOfferStatsInternal(offerId : Nat) : OfferStats {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist") };
      case (?offer) {
        {
          offer;
          clickCount = switch (clicks.get(offerId)) { case (null) { 0 }; case (?c) { c } };
          totalEarnings = switch (earnings.get(offerId)) {
            case (null) { 0.0 };
            case (?logs) { logs.foldLeft(0.0, func(acc, log) { acc + log.amount }) };
          };
        };
      };
    };
  };

  public query ({ caller }) func getClickCount(offerId : Nat) : async Nat {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer does not exist") };
      case (?_) {
        switch (clicks.get(offerId)) { case (null) { 0 }; case (?c) { c } };
      };
    };
  };

  public query ({ caller }) func getTotalClicks() : async Nat {
    clicks.values().toArray().foldLeft(0, Nat.add);
  };

  public query ({ caller }) func getTotalEarnings() : async Float {
    earnings.values().toArray().foldLeft(
      0.0,
      func(acc, logs) {
        acc + logs.toArray().foldLeft(0.0, func(innerAcc, log) { innerAcc + log.amount });
      },
    );
  };
};
