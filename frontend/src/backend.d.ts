import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VideoRequest {
    creator: Principal;
    mainTopic: string;
    requirements: ContentRequest;
    videoTitle: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SeoPackResponse {
    titles: Array<string>;
    hashtags: Array<string>;
    tags: Array<string>;
    pinnedComment: string;
    description: string;
    chapters: Array<string>;
}
export interface ImageGenerationParams {
    model: string;
    guidanceScale: number;
    seed: bigint;
    steps: bigint;
    samplerMethod: string;
    imageBase64: string;
    prompt: string;
    negativePrompt: string;
}
export interface VoiceoverRequest {
    emotion: Emotion;
    script: string;
    language: Language;
    speed: VoiceSpeed;
    voiceGender: VoiceGender;
}
export interface VideoResponse {
    animationPlan: AnimationPlan;
    script: string;
    storyboard: Storyboard;
    exportPlan: ExportPlan;
    subtitles: Array<string>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SubtitleRequest {
    script: string;
    language: Language;
    style: SubtitleStyle;
}
export interface CoinPurchasePlan {
    id: bigint;
    coinAmount: bigint;
    name: string;
    stripePriceId?: string;
    currencyCode: string;
    price: string;
}
export interface Storyboard {
    scenes: Array<string>;
}
export interface AnimationPlan {
    steps: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransactionRecord {
    principal: Principal;
    feature: string;
    transactionType: TransactionType;
    timestamp: bigint;
    balanceAfter: bigint;
    amount: bigint;
}
export interface SeoPackRequest {
    mainTopic: string;
    videoTitle: string;
}
export interface ExportPlan {
    outputDestination: string;
    animationPlan: AnimationPlan;
    script: string;
    compressionMethod: string;
    storyboard: Storyboard;
    exportFormat: string;
    qualityLevel: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ContentRequest {
    includeSubtitles: boolean;
    createScript: boolean;
    voiceLanguage: Language;
    scriptLanguage: Language;
    autoTranslateSubtitles: boolean;
    subtitleLanguage: Language;
}
export interface ColdEmailResponse {
    finalOutput: string;
    subjectLines: Array<string>;
    mainEmail: string;
    followUp1: string;
    followUp2: string;
}
export interface Message {
    height?: bigint;
    content: string;
    role: ChatRole;
    timestamp: bigint;
    imageBytes?: Uint8Array;
    width?: bigint;
}
export interface ColdEmailRequest {
    personalization: string;
    subject: string;
    companySector: string;
    useCase: string;
    recipient: string;
    meetingRequest: string;
    targetCompany: string;
    productDetails: string;
}
export interface UserProfile {
    principal: Principal;
    displayName: string;
    avatar: string;
}
export enum ChatRole {
    user = "user",
    assistant = "assistant"
}
export enum Emotion {
    normal = "normal",
    energetic = "energetic",
    serious = "serious"
}
export enum Language {
    ar = "ar",
    de = "de",
    en = "en",
    es = "es",
    fr = "fr",
    hi = "hi",
    it = "it",
    ja = "ja",
    ko = "ko",
    pt = "pt",
    ru = "ru",
    zh = "zh"
}
export enum SubtitleStyle {
    mrbeastStyle = "mrbeastStyle",
    bold = "bold",
    simple = "simple"
}
export enum TransactionType {
    credit = "credit",
    featureUsage = "featureUsage",
    debit = "debit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VoiceGender {
    female = "female",
    male = "male"
}
export enum VoiceSpeed {
    normal = "normal",
    fast = "fast",
    slow = "slow"
}
export interface backendInterface {
    adminAddCoins(user: Principal, coins: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    chargeFeatureUsage(featureName: string): Promise<void>;
    clearChatHistory(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    generateColdEmail(request: ColdEmailRequest): Promise<ColdEmailResponse>;
    generateSeoPack(request: SeoPackRequest): Promise<SeoPackResponse>;
    generateSubtitles(request: SubtitleRequest): Promise<string>;
    generateVideoResponse(request: VideoRequest): Promise<VideoResponse>;
    generateVoiceover(request: VoiceoverRequest): Promise<string>;
    getAllChatHistories(): Promise<Array<[Principal, Array<Message>]>>;
    getAllImageGenerationParams(): Promise<Array<[Principal, Array<ImageGenerationParams>]>>;
    getAppInfo(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<Message> | null>;
    getCoinBalance(): Promise<bigint>;
    getCurrentTime(): Promise<bigint>;
    getImageGenerationParams(user: Principal): Promise<Array<ImageGenerationParams> | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTransactionHistory(): Promise<Array<TransactionRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listCoinPurchasePlans(): Promise<Array<CoinPurchasePlan>>;
    processChatMessage(userMessage: Message): Promise<Array<Message>>;
    purchaseCoins(planId: bigint): Promise<bigint>;
    purchaseCoinsWithStripe(stripeSessionId: string, planId: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitImageGenerationParams(params: ImageGenerationParams): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
