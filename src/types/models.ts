// src/types/models.ts
// 全てのエンティティ型定義

// ========================================
// ユーザー関連
// ========================================

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  nick_name?: string;
  avatar_paths?: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  avatar_url?: string;
  is_admin: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 地理情報関連
// ========================================

export interface Prefecture {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count?: number;
}

export interface City {
  id: number;
  prefecture_id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count?: number;
  prefecture?: Prefecture;
}

export interface StationLine {
  id: number;
  name: string;
  name_kana?: string;
}

export interface StationGroup {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  prefecture_id: number;
  shop_count?: number;
}

export interface Station {
  id: number;
  station_line_id: number;
  station_group_id?: number;
  prefecture_id: number;
  name: string;
  name_kana: string;
  slug: string;
  latitude: number;
  longitude: number;
  station_line?: StationLine;
  station_group?: StationGroup;
  shop_count?: number;
}

export interface StationInfo {
  id: number;
  name: string;
  name_kana?: string;
  slug: string;
  line_name: string;
  distance?: number;
  distance_km?: number;
  walking_time?: number;
  walking_minutes?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  station_group?: {
    id: number;
    name: string;
    slug: string;
  };
}

// グループ化済み駅情報(複数路線が1つにまとまったもの)
export interface GroupedStationInfo {
  type: 'group' | 'single';
  station_group_id?: number | null;
  station_group_name?: string | null;
  station_id?: number;
  station_name?: string;
  name: string;
  name_kana?: string;
  slug: string;
  distance?: number;
  distance_km?: number;
  walking_time?: number;
  walking_minutes?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  line_name?: string;
  lines?: Array<{
    station_id: number;
    line_id: number;
    line_name: string;
  }>;
  prefecture_name?: string;
  prefecture_slug?: string;
  shop_count?: number;
}

// ========================================
// 検索関連
// ========================================

export interface SearchSuggestion {
  type: 'station_group' | 'station_single' | 'city';
  station_group_id?: number;
  station_id?: number;
  city_id?: number;
  name: string;
  name_kana?: string;
  slug: string;
  line_name?: string;
  prefecture_name: string;
  prefecture_slug: string;
  shop_count: number;
  display_name: string;
}

// ========================================
// 店舗基本情報
// ========================================

export interface Shop {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  address_pref: string;
  address_city: string;
  address_town: string;
  address_street?: string;
  address_building?: string;
  phone?: string;
  website_url?: string;
  open_hours_text?: string;
  business_hours?: ShopBusinessHour[];
  today_business_hour?: TodayBusinessHour;
  table_count: number;
  score_table_count: number;
  auto_table_count: number;
  postal_code?: string | null;
  prefecture_id?: number;
  city_id?: number;
  lat?: number;
  lng?: number;
  main_image_paths?: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  main_image_url?: string;
  logo_image_paths?: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  logo_image_url?: string;
  cover_image_path?: string;
  line_official_id?: string;
  line_add_url?: string;
  line_qr_code_path?: string;
  line_qr_code_url?: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  prefecture?: Prefecture;
  prefecture_name?: string;
  prefecture_slug?: string;
  city?: City;
  city_name?: string;
  city_slug?: string;
  nearest_station_slug?: string;
  nearest_station?: StationInfo;
  sub_stations?: StationInfo[];
  owner?: User;
  active_plan?: ShopPlan;
  images?: ShopImage[];
  frees?: ShopFree[];
  set?: ShopSet | null;
  rules?: ShopRule[];                    // 追加
  features?: ShopFeature[];              // 追加
  has_three_player_free?: boolean;       // 追加
  has_four_player_free?: boolean;        // 追加
  has_set?: boolean;                     // 追加
}

export interface ShopImage {
  id: number;
  shop_id: number;
  image_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  alt_text?: string;
  display_order: number;
  thumbnail_url: string;
  medium_url: string;
  large_url: string;
  created_at: string;
  updated_at: string;
}

export interface ShopFeature {
  id: number;
  shop_id: number;
  feature: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 店舗駅情報
// ========================================

export interface ShopStationData {
  main_station_id: number | null;
  sub_station_ids: number[];
  stations: {
    main?: StationInfo;
    sub: StationInfo[];
  };
}

export interface ShopStation {
  id: number;
  shop_id: number;
  station_id: number;
  distance_km: number;
  distance?: number;
  is_main: boolean;
  is_nearest?: boolean;
  walking_minutes?: number;
  walking_time?: number;
  created_at: string;
  updated_at: string;
  station?: StationInfo;
}

// ========================================
// フリー雀荘関連
// ========================================

export type GameFormat = 'THREE_PLAYER' | 'FOUR_PLAYER';
export type UserType = 'GENERAL' | 'STUDENT' | 'SENIOR' | 'WOMAN';

export interface ShopFreePrice {
  id: number;
  shop_free_rate_id: number;
  user_type: UserType;
  user_type_display: string;
  price: number;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopFreeRate {
  id: number;
  shop_free_id: number;
  rate_label: string;
  internal_memo?: string;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  prices: ShopFreePrice[];
  price_summary: {
    total_count: number;
    min_price: number | null;
    max_price: number | null;
  };
}

export interface ShopFree {
  id: number;
  shop_id: number;
  game_format: GameFormat;
  game_format_display: string;
  display_name: string;
  display_name_with_price: string;
  created_at: string;
  updated_at: string;
  rates: ShopFreeRate[];
  summary: {
    total_rates: number;
    public_rates: number;
    private_rates: number;
    min_price: number | null;
    max_price: number | null;
  };
}

// ========================================
// セット雀荘関連
// ========================================

export type DayType = 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';

export interface ShopSetPrice {
  id: number;
  shop_set_id: number;
  user_type: UserType;
  day_type: DayType;
  duration: number;
  price: number;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopSetPackagePrice {
  id: number;
  shop_set_package_id: number;
  user_type: UserType;
  user_type_display: string;
  price: number;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopSetPackage {
  id: number;
  shop_set_id: number;
  name: string;
  duration: number | null;
  day_type: DayType;
  day_type_display: string;
  details?: string;
  created_at: string;
  updated_at: string;
  prices: ShopSetPackagePrice[];
  min_price: number | null;
  max_price: number | null;
}

export interface ShopSet {
  id: number;
  shop_id: number;
  display_name: string;
  display_name_with_price: string;
  created_at: string;
  updated_at: string;
  base_prices: ShopSetPrice[];
  packages: ShopSetPackage[];
  price_summary: {
    base_prices_count: number;
    packages_count: number;
    min_base_price: number | null;
    max_base_price: number | null;
    min_package_price: number | null;
    overall_min_price: number | null;
  };
}

// ========================================
// ルール・特徴・メニュー関連
// ========================================

export interface ShopRule {
  id: number;
  shop_id: number;
  rule: string;
  created_at: string;
  updated_at: string;
  display_name: string;
  category: string | null;
  category_name: string | null;
}

export type RuleTextCategory = 'MAIN_RULES' | 'PENALTY_RULES' | 'MANNER_RULES';

export interface ShopRuleText {
  id: number;
  shop_id: number;
  category: RuleTextCategory;
  content: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MenuCategory = 'FOOD' | 'DRINK' | 'ALCOHOL' | 'OTHER';

export interface ShopMenu {
  id: number;
  shop_id: number;
  category: MenuCategory;
  category_display: string;
  item_name: string;
  description?: string;
  price: number;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// プラン関連
// ========================================

export interface ShopPlan {
  id: number;
  shop_id: number;
  plan_type: 'free' | 'paid';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  cancelled_at?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopPlanPayment {
  id: number;
  shop_id: number;
  shop_plan_id?: number;
  amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  period_start?: string;
  period_end?: string;
  transaction_id?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
  shopPlan?: ShopPlan;
}

// ========================================
// ブログ関連
// ========================================

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogPost {
  id: number;
  shop_id: number;
  user_id: number;
  title: string;
  content: string;
  status: BlogPostStatus;
  published_at?: string;
  thumbnail_paths?: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  
  // リレーション
  shop?: Shop;
  author?: User;
  images?: BlogImage[];
}

export interface BlogImage {
  id: number;
  blog_post_id: number;
  image_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  alt_text?: string;
  caption?: string;
  display_order: number;
  thumbnail_url: string;
  medium_url: string;
  large_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 営業時間関連
// ========================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ShopBusinessHour {
  id?: number;
  shop_id: number;
  day_of_week: DayOfWeek;
  day_name: string;
  is_closed: boolean;
  is_open_flexible: boolean;
  is_close_flexible: boolean;
  open_time: string | null;
  close_time: string | null;
  display_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface TodayBusinessHour {
  day_name: string;
  display_text: string;
  is_open_now: boolean;
}

export const DAY_OF_WEEK = {
  SUNDAY: { key: 0 as const, label: '日曜日', short: '日' },
  MONDAY: { key: 1 as const, label: '月曜日', short: '月' },
  TUESDAY: { key: 2 as const, label: '火曜日', short: '火' },
  WEDNESDAY: { key: 3 as const, label: '水曜日', short: '水' },
  THURSDAY: { key: 4 as const, label: '木曜日', short: '木' },
  FRIDAY: { key: 5 as const, label: '金曜日', short: '金' },
  SATURDAY: { key: 6 as const, label: '土曜日', short: '土' },
  HOLIDAY: { key: 7 as const, label: '祝日', short: '祝' },
} as const;

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  0: '日曜日',
  1: '月曜日',
  2: '火曜日',
  3: '水曜日',
  4: '木曜日',
  5: '金曜日',
  6: '土曜日',
  7: '祝日',
};

export const DAY_OF_WEEK_SHORT_LABELS: Record<DayOfWeek, string> = {
  0: '日',
  1: '月',
  2: '火',
  3: '水',
  4: '木',
  5: '金',
  6: '土',
  7: '祝',
};

// ========================================
// 定数
// ========================================

export const GAME_FORMATS = {
  THREE_PLAYER: { key: 'THREE_PLAYER' as const, label: '三人麻雀', short: '三麻' },
  FOUR_PLAYER: { key: 'FOUR_PLAYER' as const, label: '四人麻雀', short: '四麻' },
} as const;

export const USER_TYPES = {
  GENERAL: { key: 'GENERAL' as const, label: '一般', color: 'blue' },
  STUDENT: { key: 'STUDENT' as const, label: '学生', color: 'green' },
  SENIOR: { key: 'SENIOR' as const, label: 'シニア', color: 'orange' },
  WOMAN: { key: 'WOMAN' as const, label: '女性', color: 'pink' },
} as const;

export const DAY_TYPES = {
  WEEKDAY: { key: 'WEEKDAY' as const, label: '平日', color: 'blue' },
  WEEKEND: { key: 'WEEKEND' as const, label: '土日', color: 'green' },
  HOLIDAY: { key: 'HOLIDAY' as const, label: '祝日', color: 'red' },
} as const;

export const DURATION_UNITS = {
  30: { value: 30, label: '30分', display: '30分あたり' },
  60: { value: 60, label: '1時間', display: '1時間あたり' },
} as const;

export const RULE_TEXT_CATEGORIES = {
  MAIN_RULES: { 
    key: 'MAIN_RULES' as const, 
    label: '主なルール',
    description: '基本的なゲームルールを記載',
  },
  PENALTY_RULES: { 
    key: 'PENALTY_RULES' as const, 
    label: 'アガリ放棄・チョンボ',
    description: 'ペナルティに関するルールを記載',
  },
  MANNER_RULES: { 
    key: 'MANNER_RULES' as const, 
    label: 'マナー・禁止事項',
    description: 'マナーや禁止事項を記載',
  },
} as const;

export const MENU_CATEGORIES = {
  FOOD: { key: 'FOOD' as const, label: 'フード' },
  DRINK: { key: 'DRINK' as const, label: 'ドリンク' },
  ALCOHOL: { key: 'ALCOHOL' as const, label: 'アルコール' },
  OTHER: { key: 'OTHER' as const, label: 'その他' },
} as const;

export interface ShopService {
  id: number;
  shop_id: number;
  service_type: string;
  created_at: string;
  updated_at: string;
  display_name?: string;
  category?: string;
  category_name?: string;
}

// サービスタイプの定数
export const SERVICE_TYPES = {
  // ドリンク・割引
  FREE_DRINK: { key: 'FREE_DRINK' as const, label: '飲み放題', category: 'DRINK' },
  FREE_DRINK_SET: { key: 'FREE_DRINK_SET' as const, label: '飲み放題セット', category: 'DRINK' },
  STUDENT_DISCOUNT: { key: 'STUDENT_DISCOUNT' as const, label: '学割', category: 'DISCOUNT' },
  FEMALE_DISCOUNT: { key: 'FEMALE_DISCOUNT' as const, label: '女性割引', category: 'DISCOUNT' },
  SENIOR_DISCOUNT: { key: 'SENIOR_DISCOUNT' as const, label: 'シニア割引', category: 'DISCOUNT' },
  
  // 駐車場
  PARKING_AVAILABLE: { key: 'PARKING_AVAILABLE' as const, label: '駐車場あり', category: 'PARKING' },
  PARKING_SUBSIDY: { key: 'PARKING_SUBSIDY' as const, label: '駐車料金補助', category: 'PARKING' },
  
  // 喫煙
  NON_SMOKING: { key: 'NON_SMOKING' as const, label: '禁煙', category: 'SMOKING' },
  HEATED_TOBACCO_ALLOWED: { key: 'HEATED_TOBACCO_ALLOWED' as const, label: '加熱式タバコ可', category: 'SMOKING' },
  SMOKING_ALLOWED: { key: 'SMOKING_ALLOWED' as const, label: '喫煙可', category: 'SMOKING' },
  
  // 飲食
  FOOD_AVAILABLE: { key: 'FOOD_AVAILABLE' as const, label: '食事あり', category: 'FOOD' },
  ALCOHOL_AVAILABLE: { key: 'ALCOHOL_AVAILABLE' as const, label: 'アルコールあり', category: 'FOOD' },
  DELIVERY_MENU: { key: 'DELIVERY_MENU' as const, label: 'デリバリーメニュー', category: 'FOOD' },
  OUTSIDE_FOOD_ALLOWED: { key: 'OUTSIDE_FOOD_ALLOWED' as const, label: '持ち込み可', category: 'FOOD' },
  
  // 設備
  PRIVATE_ROOM: { key: 'PRIVATE_ROOM' as const, label: '個室あり', category: 'FACILITY' },
  FEMALE_TOILET: { key: 'FEMALE_TOILET' as const, label: '女性専用トイレ', category: 'FACILITY' },
  AUTO_TABLE: { key: 'AUTO_TABLE' as const, label: '全自動卓', category: 'FACILITY' },
  SCORE_MANAGEMENT: { key: 'SCORE_MANAGEMENT' as const, label: 'スコア管理', category: 'FACILITY' },
  FREE_WIFI: { key: 'FREE_WIFI' as const, label: 'Wi-Fi無料', category: 'FACILITY' },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;