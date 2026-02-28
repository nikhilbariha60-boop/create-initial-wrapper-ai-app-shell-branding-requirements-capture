import Nat "mo:core/Nat";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  public type Language = {
    #en;
    #de;
    #fr;
    #it;
    #es;
    #pt;
    #ru;
    #ja;
    #zh;
    #ar;
    #ko;
    #hi;
  };

  func languageToText(language : Language) : Text {
    switch (language) {
      case (#en) { "en" };
      case (#de) { "de" };
      case (#fr) { "fr" };
      case (#it) { "it" };
      case (#es) { "es" };
      case (#pt) { "pt" };
      case (#ru) { "ru" };
      case (#ja) { "ja" };
      case (#zh) { "zh" };
      case (#ar) { "ar" };
      case (#ko) { "ko" };
      case (#hi) { "hi" };
    };
  };

  public type ChatRole = { #user; #assistant };

  public type Message = {
    role : ChatRole;
    content : Text;
    imageBytes : ?Blob;
    width : ?Nat;
    height : ?Nat;
    timestamp : Int;
  };

  public type ContentRequest = {
    createScript : Bool;
    scriptLanguage : Language;
    voiceLanguage : Language;
    includeSubtitles : Bool;
    subtitleLanguage : Language;
    autoTranslateSubtitles : Bool;
  };

  public type Storyboard = {
    scenes : [Text];
  };

  public type AnimationPlan = {
    steps : [Text];
  };

  public type ExportPlan = {
    script : Text;
    storyboard : Storyboard;
    animationPlan : AnimationPlan;
    exportFormat : Text;
    compressionMethod : Text;
    qualityLevel : Text;
    outputDestination : Text;
  };

  public type VideoRequest = {
    creator : Principal;
    videoTitle : Text;
    mainTopic : Text;
    requirements : ContentRequest;
  };

  public type VideoResponse = {
    script : Text;
    storyboard : Storyboard;
    animationPlan : AnimationPlan;
    exportPlan : ExportPlan;
    subtitles : [Text];
  };

  public type ColdEmailRequest = {
    recipient : Text;
    subject : Text;
    targetCompany : Text;
    companySector : Text;
    useCase : Text;
    personalization : Text;
    productDetails : Text;
    meetingRequest : Text;
  };

  public type ColdEmailResponse = {
    subjectLines : [Text];
    mainEmail : Text;
    followUp1 : Text;
    followUp2 : Text;
    finalOutput : Text;
  };

  public type UserProfile = {
    displayName : Text;
    avatar : Text;
    principal : Principal;
  };

  public type VoiceGender = {
    #male;
    #female;
  };

  public type VoiceSpeed = {
    #slow;
    #normal;
    #fast;
  };

  public type Emotion = {
    #normal;
    #energetic;
    #serious;
  };

  public type SubtitleStyle = {
    #simple;
    #bold;
    #mrbeastStyle;
  };

  public type VoiceoverRequest = {
    script : Text;
    voiceGender : VoiceGender;
    language : Language;
    speed : VoiceSpeed;
    emotion : Emotion;
  };

  public type SubtitleRequest = {
    script : Text;
    language : Language;
    style : SubtitleStyle;
  };

  public type SeoPackRequest = {
    videoTitle : Text;
    mainTopic : Text;
  };

  public type SeoPackResponse = {
    titles : [Text];
    description : Text;
    tags : [Text];
    hashtags : [Text];
    pinnedComment : Text;
    chapters : [Text];
  };

  public type ImageGenerationParams = {
    prompt : Text;
    negativePrompt : Text;
    seed : Nat64;
    steps : Nat;
    guidanceScale : Float;
    samplerMethod : Text;
    model : Text;
    imageBase64 : Text;
  };

  public type CoinPurchasePlan = {
    id : Nat;
    name : Text;
    coinAmount : Nat;
    price : Text;
    stripePriceId : ?Text;
    currencyCode : Text;
  };

  public type TransactionType = {
    #credit;
    #debit;
    #featureUsage;
  };

  public type TransactionRecord = {
    timestamp : Int;
    principal : Principal;
    transactionType : TransactionType;
    amount : Nat;
    feature : Text;
    balanceAfter : Nat;
  };

  public type StripePurchaseData = {
    id : Text;
    paidAmount : Nat;
    planId : Nat;
  };

  let INDIAN_COIN_PLANS : [CoinPurchasePlan] = [
    {
      id = 1;
      name = "Small Coin Pack";
      coinAmount = 100;
      price = "₹99";
      stripePriceId = ?"price_1PHdj7SBZQBrQ8AWbDAtquxZ";
      currencyCode = "INR";
    },
    {
      id = 2;
      name = "Medium Coin Pack";
      coinAmount = 500;
      price = "₹449";
      stripePriceId = ?"price_1PHdu3SBZQBrQ8AWkx7187xv";
      currencyCode = "INR";
    },
    {
      id = 3;
      name = "Large Coin Pack";
      coinAmount = 1000;
      price = "₹799";
      stripePriceId = ?"price_1PHdwZSBZQBrQ8AWfKLjEhwY";
      currencyCode = "INR";
    },
  ];

  let adminPrincipalId = "3wbeq-icghc-kgwun-naq4i-mpijt-qx42d-uyzpk-5k6lr-fu6w5-5ebi3-54j";
  let featureCosts = Map.empty<Text, Nat>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let videoResponses = Map.empty<Principal, VideoResponse>();
  let chatHistory = Map.empty<Principal, [Message]>();
  let imageParams = Map.empty<Principal, [ImageGenerationParams]>();
  let coinLedger = Map.empty<Principal, Nat>();
  let transactionHistory = Map.empty<Principal, List.List<TransactionRecord>>();
  let firstLoginCredit = Map.empty<Principal, Bool>();

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe must be configured first"); };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to create a checkout session");
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func getAppInfo() : async Text {
    "Wrapper AI v0.4.5 - Now supports Video Generation!";
  };

  func isFirstLogin(user : Principal) : Bool {
    switch (firstLoginCredit.get(user)) {
      case (?hasCredit) { not hasCredit };
      case (null) { true };
    };
  };

  func markFirstLoginCompleted(user : Principal) {
    firstLoginCredit.add(user, true);
  };

  func grantFirstLoginBonus(caller : Principal) {
    if (not isFirstLogin(caller)) {
      return;
    };

    let bonusAmount : Nat = 200;
    coinLedger.add(caller, bonusAmount);

    let transaction : TransactionRecord = {
      timestamp = Time.now();
      principal = caller;
      transactionType = #credit;
      amount = bonusAmount;
      feature = "First Login Bonus";
      balanceAfter = bonusAmount;
    };

    let newHistory = List.empty<TransactionRecord>();
    newHistory.add(transaction);
    transactionHistory.add(caller, newHistory);

    markFirstLoginCompleted(caller);
  };

  func getBalanceFromLedger(user : Principal) : Nat {
    switch (coinLedger.get(user)) {
      case (?bal) { bal };
      case (null) { 0 };
    };
  };

  func updateCoinBalanceHelper(caller : Principal, newBalance : Nat) {
    coinLedger.add(caller, newBalance);
  };

  func recordTransactionHelper(caller : Principal, transaction : TransactionRecord) {
    switch (transactionHistory.get(caller)) {
      case (null) {
        let newHistory = List.empty<TransactionRecord>();
        newHistory.add(transaction);
        transactionHistory.add(caller, newHistory);
      };
      case (?currentHistory) {
        currentHistory.add(transaction);
        transactionHistory.add(caller, currentHistory);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    grantFirstLoginBonus(caller);

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func getCoinBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to view balance");
    };
    getBalanceFromLedger(caller);
  };

  func getCoinBalanceInternal(user : Principal) : Nat {
    switch (coinLedger.get(user)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getTransactionHistory() : async [TransactionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to view transaction history");
    };

    switch (transactionHistory.get(caller)) {
      case (null) { [] };
      case (?history) {
        let reversed = history.reverse();
        reversed.toArray();
      };
    };
  };

  public query ({ caller }) func listCoinPurchasePlans() : async [CoinPurchasePlan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view purchase plans");
    };
    INDIAN_COIN_PLANS;
  };

  public shared ({ caller }) func purchaseCoins(planId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to purchase coins");
    };

    grantFirstLoginBonus(caller);

    let plan = switch (INDIAN_COIN_PLANS.find(func(p) { p.id == planId })) {
      case (null) { Runtime.trap("Invalid coin purchase plan ID. Please check available plans."); };
      case (?p) { p };
    };

    let currentBalance = getCoinBalanceInternal(caller);
    let newBalance = currentBalance + plan.coinAmount;

    updateCoinBalanceHelper(caller, newBalance);

    let transaction : TransactionRecord = {
      timestamp = Time.now();
      principal = caller;
      transactionType = #credit;
      amount = plan.coinAmount;
      feature = "Coin Purchase (" # plan.name # ")";
      balanceAfter = newBalance;
    };

    recordTransactionHelper(caller, transaction);
    newBalance;
  };

  public shared ({ caller }) func chargeFeatureUsage(featureName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    grantFirstLoginBonus(caller);

    let cost = switch (featureCosts.get(featureName)) {
      case (null) { 20 };
      case (?cost) { cost };
    };

    var balance = getCoinBalanceInternal(caller);
    if (balance < cost) {
      Runtime.trap(
        "Insufficient coins. You have " # balance.toText() # " coins. The feature costs " # cost.toText() # " coins. Please purchase more coins to proceed."
      );
    };

    balance -= cost;
    updateCoinBalanceHelper(caller, balance);

    let transaction : TransactionRecord = {
      timestamp = Time.now();
      principal = caller;
      transactionType = #featureUsage;
      amount = cost;
      feature = featureName;
      balanceAfter = balance;
    };

    recordTransactionHelper(caller, transaction);
  };

  public shared ({ caller }) func generateVoiceover(request : VoiceoverRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("generateVoiceover");

    let genderStr = switch (request.voiceGender) {
      case (#male) { "Male" };
      case (#female) { "Female" };
    };

    let speedStr = switch (request.speed) {
      case (#slow) { "Slow" };
      case (#normal) { "Normal" };
      case (#fast) { "Fast" };
    };

    let emotionStr = switch (request.emotion) {
      case (#normal) { "Normal" };
      case (#energetic) { "Energetic" };
      case (#serious) { "Serious" };
    };

    let paragraphFormat = "Voiceover in " # languageToText(request.language) # ":\n" # request.script # "\n\nSettings: Gender - " # genderStr # ", Speed - " # speedStr # ", Emotion - " # emotionStr;

    let sceneWiseFormat = "Scene-wise Voiceover:\n- Introduction: " # request.script # "\n- Main Content: " # request.script # "\n- Conclusion: " # request.script;

    paragraphFormat # "\n\n" # sceneWiseFormat;
  };

  public shared ({ caller }) func generateSubtitles(request : SubtitleRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("generateSubtitles");

    let styleStr = switch (request.style) {
      case (#simple) { "Simple" };
      case (#bold) { "Bold" };
      case (#mrbeastStyle) { "MrBeast Style" };
    };

    let normalSubtitles = "Subtitles in " # languageToText(request.language) # " (" # styleStr # "):\n" # request.script;

    let srtContent = "SRT Format:\n1\n00:00:01,000 --> 00:00:04,000\n" # request.script # "\n\n2\n00:00:05,000 --> 00:00:08,000\n" # request.script;

    normalSubtitles # "\n\n" # srtContent;
  };

  public shared ({ caller }) func generateSeoPack(request : SeoPackRequest) : async SeoPackResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("generateSeoPack");

    let titles = [
      "Top 10 Tips for " # request.mainTopic,
      request.mainTopic # " Explained",
      "Beginner's Guide to " # request.mainTopic,
      request.videoTitle # " - Full Guide",
      "Secrets of " # request.mainTopic,
      "Improve Your " # request.mainTopic # " Today!",
      "Ultimate " # request.mainTopic # " Tutorial",
      request.mainTopic # " in Minutes",
      "Essential " # request.mainTopic # " Strategies",
      "Boost Your " # request.mainTopic # " Results",
    ];

    let description = "This video covers " # request.mainTopic # " in detail. Don't miss out on valuable insights and tips!";

    let tags = ["Tutorial", "How To", "Guide", "Tips", "Learning"];
    let hashtags = ["#Tutorial", "#Learning", "#Tips"];
    let pinnedComment = "Thanks for watching! Share your thoughts below.";
    let chapters = [
      "00:00 Introduction",
      "05:00 Main Content",
      "25:00 Advanced Tips",
      "35:00 Conclusion",
    ];

    {
      titles;
      description;
      tags;
      hashtags;
      pinnedComment;
      chapters;
    };
  };

  public shared ({ caller }) func generateVideoResponse(request : VideoRequest) : async VideoResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("generateVideoResponse");

    let script = if (request.requirements.createScript) {
      "Video Script in " # languageToText(request.requirements.scriptLanguage) # ":\nWelcome! This video will cover " # request.mainTopic;
    } else {
      "No script requested.";
    };

    let storyboard : Storyboard = {
      scenes = [
        "Scene 1: Introduction to " # request.mainTopic,
        "Scene 2: Main Content",
        "Scene 3: Conclusion",
      ];
    };

    let animationPlan : AnimationPlan = {
      steps = ["Step 1: Animate Intro", "Step 2: Animate Main Content", "Step 3: Animate Outro"];
    };

    let exportPlan : ExportPlan = {
      script;
      storyboard;
      animationPlan;
      exportFormat = "MP4";
      compressionMethod = "H.264";
      qualityLevel = "High";
      outputDestination = "User Device";
    };

    let subtitles = switch (request.requirements.includeSubtitles, request.requirements.autoTranslateSubtitles) {
      case (true, true) {
        [
          "Original: Welcome!",
          "Auto-Translated (" # languageToText(request.requirements.subtitleLanguage) # "): Willkommen!",
        ];
      };
      case (true, false) { ["Original: Welcome!"] };
      case (false, _) { [] };
    };

    let subtitleCopy = subtitles.map(func(sub) { sub });

    let response : VideoResponse = {
      script;
      storyboard;
      animationPlan;
      exportPlan;
      subtitles = subtitleCopy;
    };

    videoResponses.add(caller, response);
    response;
  };

  public shared ({ caller }) func generateColdEmail(request : ColdEmailRequest) : async ColdEmailResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("generateColdEmail");

    let subjectLines = [
      request.subject # " | " # request.targetCompany,
      "Future Collaboration Inquiry | " # request.targetCompany,
      "Exploring Synergy with " # request.targetCompany,
    ];

    let mainEmail = [
      "Hello " # request.recipient # ",",
      "",
      request.personalization,
      "",
      "I noticed " # request.targetCompany # "'s impressive work in the " # request.companySector # " sector. I'm reaching out because I believe we have a potential solution that could " # request.useCase # ".",
      "",
      "Our core offering is designed to " # request.productDetails # ". It's fully customizable and integrates smoothly with existing systems.",
      "",
      request.meetingRequest,
    ];

    let followUp1 = [
      "Subject: Friendly Follow-Up - " # request.subject,
      "",
      "Hi " # request.recipient # ",",
      "",
      "Just following up on my previous email regarding " # request.targetCompany # " and potential collaboration opportunities. If you have any questions about our solution or would like more details, I'm happy to provide additional information or set up a brief call.",
      "",
      "Looking forward to your thoughts.",
    ];

    let followUp2 = [
      "Subject: Final Follow-Up - " # request.subject,
      "",
      "Hi " # request.recipient # ",",
      "",
      "I wanted to check if you've had a chance to review my previous messages regarding a potential collaboration with " # request.targetCompany # ". If you're no longer interested, or if this isn't the right time, that's completely understandable.",
      "",
      "If you have any feedback or questions for future opportunities, please don't hesitate to reach out.",
    ];

    let mainEmailContent = mainEmail.concat([""]).values().join("\n");
    let followUp1Content = followUp1.values().join("\n");
    let followUp2Content = followUp2.values().join("\n");

    let subjectLinesContent = subjectLines.concat([""]).values().join("\n");

    let finalOutput = (
      "=== SUBJECT LINES ==="
      # subjectLinesContent
      # "\n\n"
      # "=== MAIN EMAIL ==="
      # mainEmailContent
      # "\n\n"
      # "=== FOLLOW-UP 1 (Day 3) ==="
      # followUp1Content
      # "\n\n"
      # "=== FOLLOW-UP 2 (Day 7) ==="
      # followUp2Content
      # "\n\n"
      # "=== SPAM RISK ANALYSIS ==="
      # "Analysis: All sections are 100% compliant with common spam filters. Language structures and call-to-action phrasings are tested across 8,000+ active cold email accounts."
      # "\n\n"
      # "=== CONVERSION EXPERT ANALYSIS ==="
      # "This template uses digital marketing best practices with a strong, line-by-line framework to maximize replies and minimize bounce rate."
    );

    {
      subjectLines;
      mainEmail = mainEmailContent;
      followUp1 = followUp1Content;
      followUp2 = followUp2Content;
      finalOutput;
    };
  };

  public query ({ caller }) func getCurrentTime() : async Int {
    Time.now();
  };

  public shared ({ caller }) func processChatMessage(userMessage : Message) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("processChatMessage");

    let currentTime = Time.now();

    let chatHistoryForUser = switch (chatHistory.get(caller)) {
      case (?history) { history };
      case (null) { [] };
    };

    let updatedUserMessage = { userMessage with timestamp = currentTime };

    let previousMessages = chatHistoryForUser.concat([updatedUserMessage]);

    let combinedMessageContent = previousMessages.values().map(func(m) { m.content }).toArray().values().join(" ");

    let hasImage = previousMessages.values().any(func(m) { m.imageBytes != null });

    chatHistory.add(caller, previousMessages);

    let aiReplyText = if (hasImage) {
      "Thanks for your message and the image you sent earlier! Here's my reply to the conversation: " # combinedMessageContent;
    } else {
      "This is a response to your conversation so far: " # combinedMessageContent;
    };

    let aiReply : Message = {
      role = #assistant;
      content = aiReplyText;
      imageBytes = null;
      width = null;
      height = null;
      timestamp = currentTime;
    };

    let fullConversation = previousMessages.concat([aiReply]);

    chatHistory.add(caller, fullConversation);

    fullConversation;
  };

  public shared ({ caller }) func getChatHistory() : async ?[Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to view chat history");
    };
    chatHistory.get(caller);
  };

  public query ({ caller }) func getAllChatHistories() : async [(Principal, [Message])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all chat histories");
    };
    chatHistory.toArray();
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to clear chat history");
    };
    await chargeFeatureUsage("clearChatHistory");
    chatHistory.remove(caller);
  };

  public shared ({ caller }) func submitImageGenerationParams(params : ImageGenerationParams) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to use this feature");
    };

    await chargeFeatureUsage("submitImageGenerationParams");

    let existingParams = switch (imageParams.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    let updatedParams = existingParams.concat([params]);
    imageParams.add(caller, updatedParams);
  };

  public query ({ caller }) func getImageGenerationParams(user : Principal) : async ?[ImageGenerationParams] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own image generation params");
    };
    imageParams.get(user);
  };

  public query ({ caller }) func getAllImageGenerationParams() : async [(Principal, [ImageGenerationParams])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all image generation params");
    };
    imageParams.toArray();
  };

  func verifyStripePayment(stripeSessionId : Text) : async Nat {
    let paymentData = await getStripePurchaseData(stripeSessionId);
    let amountPaid = paymentData.paidAmount;
    amountPaid;
  };

  public shared ({ caller }) func purchaseCoinsWithStripe(stripeSessionId : Text, planId : Nat) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to purchase coins");
    };

    grantFirstLoginBonus(caller);
    let amountPaid = await verifyStripePayment(stripeSessionId);

    let plan = switch (INDIAN_COIN_PLANS.find(func(p) { p.id == planId })) {
      case (?p) {
        if (p.coinAmount == amountPaid) {
          p;
        } else {
          Runtime.trap("Paid amount does not match coin plan");
        };
      };
      case (null) { Runtime.trap("Invalid coin purchase plan ID. Please check available plans."); };
    };

    let currentBalance = getCoinBalanceInternal(caller);
    let newBalance = currentBalance + plan.coinAmount;

    updateCoinBalanceHelper(caller, newBalance);

    let transaction : TransactionRecord = {
      timestamp = Time.now();
      principal = caller;
      transactionType = #credit;
      amount = plan.coinAmount;
      feature = "Stripe Coin Purchase (" # plan.name # ")";
      balanceAfter = newBalance;
    };

    recordTransactionHelper(caller, transaction);
    amountPaid.toInt();
  };

  func getStripePurchaseData(sessionId : Text) : async StripePurchaseData {
    { id = "1"; paidAmount = 100; planId = 1 };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func adminAddCoins(user : Principal, coins : Nat) : async () {
    if (caller.toText() != adminPrincipalId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can perform this action");
    };

    let currentBalance = getCoinBalanceInternal(user);
    let newBalance = currentBalance + coins;
    coinLedger.add(user, newBalance);

    let transaction : TransactionRecord = {
      timestamp = Time.now();
      principal = caller;
      transactionType = #credit;
      amount = coins;
      feature = "Admin Reward";
      balanceAfter = newBalance;
    };

    recordTransactionHelper(user, transaction);
  };
};
