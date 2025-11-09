// src/types/api.ts
import { 
  User, 
  Shop, 
  ShopPlan, 
  ShopPlanPayment, 
  BlogPost, 
  StationInfo, 
  ShopImage, 
  BlogImage, 
  ShopFeature,
  ShopFree,
  ShopFreeRate,
  ShopSet,
  ShopRule,
  ShopRuleText,
  ShopMenu,
} from './models';

// ========================================
// 共通レスポンス型
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>; // バリデーションエラー
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url?: string;
  from: number;
  last_page: number;
  last_page_url?: string;
  links?: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path?: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// ========================================
// 認証関連
// ========================================

export interface RegisterRequest {
  email: string;
}

export interface RegisterResponse {
  // data: null
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  email: string;
  token: string;
}

export interface CompleteRegistrationRequest {
  token: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
  nick_name?: string;
}

export interface CompleteRegistrationResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface UploadAvatarResponse {
  avatar_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  avatar_url: string;
}

// ========================================
// 雀荘関連
// ========================================

export interface ShopListParams {
  prefecture_id?: number;
  city_id?: number;
  keyword?: string;
  has_auto_tables?: boolean;
  has_score_tables?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateShopRequest {
  name: string;
  description?: string;
  phone?: string;
  website_url?: string;
  open_hours_text?: string;
  business_hours?: Array<{
    day_of_week: number;
    is_closed?: boolean;
    is_24h?: boolean;
    open_time?: string;
    close_time?: string;
    note?: string;
  }>;
  table_count: number;
  score_table_count: number;
  auto_table_count: number;
  postal_code?: string;
  address_pref: string;
  address_city: string;
  address_town: string;
  address_street?: string;
  address_building?: string;
  prefecture_id: number;
  city_id: number;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  phone?: string;
  website_url?: string;
  open_hours_text?: string;
  business_hours?: Array<{
    day_of_week: number;
    is_closed?: boolean;
    is_24h?: boolean;
    open_time?: string;
    close_time?: string;
    note?: string;
  }>;
  table_count?: number;
  score_table_count?: number;
  auto_table_count?: number;
  postal_code?: string;
  address_pref?: string;
  address_city?: string;
  address_town?: string;
  address_street?: string;
  address_building?: string;
  prefecture_id?: number;
  city_id?: number;
  lat?: number;
  lng?: number;
  line_official_id?: string;
  line_add_url?: string;
}

export interface UploadMainImageResponse {
  main_image_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  main_image_url: string;
}

export interface AddGalleryImageResponse {
  image: {
    id: number;
    image_paths: {
      original: string;
      thumb: string;
      medium: string;
      large: string;
    };
    alt_text: string | null;
    display_order: number;
    image_url: string;
  };
}

export interface ReorderGalleryImagesRequest {
  image_orders: Array<{
    id: number;
    display_order: number;
  }>;
}

// ========================================
// 駅情報関連
// ========================================

export interface NearbyStationsParams {
  lat: number;
  lng: number;
  max_stations?: number;
  max_distance?: number;
}

export interface NearbyStationsByAddressParams {
  address: string;
}

export interface StationSearchParams {
  keyword: string;
  limit?: number;
}

export interface ShopStationsResponse {
  main_station: StationInfo | null;
  sub_stations: StationInfo[];
  total_count: number;
}

export interface UpdateShopStationsRequest {
  main_station_id?: number;
  sub_station_ids?: number[];
}

// ========================================
// LINE機能関連
// ========================================

export interface LineInfoResponse {
  line_official_id: string | null;
  line_add_url: string | null;
  line_qr_code_path: string | null;
  line_qr_code_url: string | null;
  has_line_account: boolean;
  has_line_qr_code: boolean;
  can_use_line: boolean;
}

export interface UpdateLineInfoRequest {
  line_official_id?: string;
  line_add_url?: string;
}

export interface UpdateLineInfoResponse {
  line_official_id: string | null;
  line_add_url: string | null;
  has_line_account: boolean;
}

export interface UploadLineQrCodeResponse {
  line_qr_code_path: string;
  line_qr_code_url: string;
}

// ========================================
// ロゴ画像関連
// ========================================

export interface UploadLogoImageResponse {
  logo_image_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  logo_image_url: string;
}

// ========================================
// プラン管理関連
// ========================================

export interface ShopPlanResponse {
  has_plan: boolean;
  plan?: {
    id: number;
    plan_type: 'free' | 'paid';
    status: 'active' | 'expired' | 'cancelled';
    started_at: string;
    expires_at: string;
    remaining_days: number | null;
    expires_in_human: string | null;
    auto_renew: boolean;
    is_valid: boolean;
  } | null;
  plan_type?: 'free';
  status?: null;
  is_paid_plan: boolean;
  can_use_line: boolean;
  can_use_gallery: boolean;
  can_use_blog: boolean;
}

export interface ShopPlanHistoryItem {
  id: number;
  plan_type: 'free' | 'paid';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  auto_renew: boolean;
  remaining_days: number | null;
}

export interface ShopPlanPaymentHistoryItem {
  id: number;
  amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  transaction_id: string | null;
  plan_type: 'free' | 'paid' | null;
  created_at: string;
}

export interface StartPaidPlanRequest {
  duration_months?: number;
}

export interface StartPaidPlanResponse {
  plan: {
    id: number;
    plan_type: 'free' | 'paid';
    status: 'active' | 'expired' | 'cancelled';
    started_at: string;
    expires_at: string;
    remaining_days: number | null;
  };
  payment: {
    id: number;
    amount: number;
    paid_at: string;
  };
}

export interface CancelPlanResponse {
  plan: {
    id: number;
    status: 'active' | 'expired' | 'cancelled';
    cancelled_at: string;
    expires_at: string;
    remaining_days: number | null;
  };
  message: string;
}

// ========================================
// ブログ関連
// ========================================

export interface BlogPostListParams {
  shop_id?: number;
  keyword?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateBlogPostRequest {
  shop_id: number;
  title: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED';
  published_at?: string | null;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published_at?: string | null;
}

export interface UploadBlogThumbnailResponse {
  thumbnail_paths: {
    original: string;
    thumb: string;
    medium: string;
    large: string;
  };
  thumbnail_url: string;
}

export interface AddBlogImageResponse {
  image: {
    id: number;
    image_paths: {
      original: string;
      thumb: string;
      medium: string;
      large: string;
    };
    alt_text: string | null;
    caption: string | null;
    display_order: number;
    image_url: string;
  };
}

export interface ReorderBlogImagesRequest {
  image_orders: Array<{
    id: number;
    display_order: number;
  }>;
}

// ========================================
// 雀荘特徴関連
// ========================================

export interface AvailableFeature {
  value: string;
  label: string;
}

export interface UpdateShopFeaturesRequest {
  features: string[];
}

// ========================================
// 雀荘ルール関連
// ========================================

export interface AvailableRule {
  value: string;
  label: string;
}

export interface UpdateShopRulesRequest {
  rules: string[];
}

export interface UpdateRuleTextRequest {
  content: string;
}

// ========================================
// 雀荘メニュー関連
// ========================================

export interface CreateMenuRequest {
  item_name: string;
  category: 'FOOD' | 'DRINK' | 'ALCOHOL' | 'OTHER';
  price: number;
  description?: string;
  is_available?: boolean;
}

export interface UpdateMenuRequest {
  item_name?: string;
  category?: 'FOOD' | 'DRINK' | 'ALCOHOL' | 'OTHER';
  price?: number;
  description?: string;
  is_available?: boolean;
}

// ========================================
// フリー雀荘関連
// ========================================

export interface CreateFreeRequest {
  game_format: 'THREE_PLAYER' | 'FOUR_PLAYER';
}

export interface UpdateFreeRequest {
  game_format?: 'THREE_PLAYER' | 'FOUR_PLAYER';
}

export interface CreateRateRequest {
  rate_label: string;
  internal_memo?: string;
  is_public?: boolean;
  display_order?: number;
}

export interface UpdateRateRequest {
  rate_label?: string;
  internal_memo?: string;
  is_public?: boolean;
  display_order?: number;
}

export interface SetRatePricesRequest {
  prices: {
    [userType: string]: number | {
      price: number;
      details?: string;
    };
  };
}

export interface FreeListResponse {
  shop_info: {
    id: number;
    name: string;
  };
  summary: {
    total_plans: number;
    three_player_plans: number;
    four_player_plans: number;
    has_three_player: boolean;
    has_four_player: boolean;
  };
  plans_by_format: {
    three_player: ShopFree[];
    four_player: ShopFree[];
  };
  all_plans: ShopFree[];
}

// ========================================
// セット雀荘関連
// ========================================

export interface CreateSetRequest {
  // セット雀荘は店舗ごとに1つなので、特に必要なパラメータなし
}

export interface UpdateSetRequest {
  // 更新時も特に必要なパラメータなし（価格は別API）
}

export interface SetBasePricesRequest {
  prices: Array<{
    user_type: 'GENERAL' | 'STUDENT' | 'SENIOR' | 'WOMAN';
    day_type: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
    duration: 30 | 60;
    price: number;
    details?: string;
  }>;
}

export interface CreatePackageRequest {
  name: string;
  duration?: number;
  day_type: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
  details?: string;
}

export interface UpdatePackageRequest {
  name?: string;
  duration?: number;
  day_type?: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
  details?: string;
}

export interface SetPackagePricesRequest {
  prices: {
    [userType: string]: number | {
      price: number;
      details?: string;
    };
  };
}

// ========================================
// 住所処理関連
// ========================================

export interface PostalCodeRequest {
  postal_code: string;
}

export interface PostalCodeResponse {
  postcode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  pref: string;
  city: string;
  town: string;
  allAddress: string;
}

export interface NormalizeAddressRequest {
  address: string;
}

export interface NormalizeAddressResponse {
  original: string;
  pref: string;
  city: string;
  town: string;
  addr: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  level: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProcessAddressRequest {
  postal_code: string;
  address_detail?: string;
  building?: string;
}

export interface ProcessAddressResponse {
  postalCode: string;
  baseAddress: {
    pref: string;
    city: string;
    town: string;
    allAddress: string;
  };
  inputDetail: {
    addressDetail: string;
    building: string;
  };
  fullAddress: string;
  normalized: {
    pref: string;
    city: string;
    town: string;
    addr: string;
    fullAddress: string;
    level: number;
    coordinates: {
      lat: number;
      lng: number;
    } | null;
  } | null;
}

export interface GeocodeRequest {
  address: string;
}

export interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
  types: string[];
  location_type: string;
}

// ========================================
// 特徴管理関連レスポンス
// ========================================

export interface ShopFeaturesResponse {
  shop_info: {
    id: number;
    name: string;
  };
  summary: {
    total_features: number;
    categories_count: number;
    is_healthy_mahjong: boolean;
    has_pro_staff: boolean;
    is_female_friendly: boolean;
  };
  stats: {
    game_style_features: number;
    staff_features: number;
    health_related: number;
    gender_related: number;
    pro_related: number;
  };
  features_by_category: {
    [category: string]: {
      name: string;
      features: Array<{
        id: number;
        feature: string;
        display_name: string;
        description: string | null;
        category: string;
        category_name: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
  all_features: Array<{
    id: number;
    feature: string;
    display_name: string;
    description: string | null;
    category: string;
    category_name: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface AvailableFeaturesResponse {
  all_features: {
    [key: string]: string;
  };
  descriptions: {
    [key: string]: string;
  };
  categorized_features: {
    [category: string]: {
      name: string;
      features: Array<{
        key: string;
        name: string;
        description: string | null;
      }>;
    };
  };
}

// ========================================
// ルール管理関連レスポンス
// ========================================

export interface ShopRulesResponse {
  shop_info: {
    id: number;
    name: string;
  };
  summary: {
    total_rules: number;
    categories_count: number;
    has_special_rules: boolean;
    is_tonpu: boolean;
    is_tonnan: boolean;
    has_kuitan: boolean;
    has_red_tiles: boolean;
  };
  stats: {
    basic_rules: number;
    renchan_rules: number;
    special_rules: number;
    game_style_rules: number;
    calculation_rules: number;
  };
  rules_by_category: {
    [category: string]: {
      name: string;
      rules: Array<{
        id: number;
        rule: string;
        display_name: string;
        category: string;
        category_name: string;
        rule_type: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
  all_rules: Array<{
    id: number;
    rule: string;
    display_name: string;
    category: string;
    category_name: string;
    rule_type: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface AvailableRulesResponse {
  all_rules: {
    [key: string]: string;
  };
  categorized_rules: {
    [category: string]: {
      name: string;
      type: string;
      allow_unset: boolean;
      rules: Array<{
        key: string;
        name: string;
      }>;
      groups?: any;
    };
  };
  exclusive_pairs: Array<[string, string]>;
}

// ========================================
// ルールテキスト関連レスポンス
// ========================================

export interface RuleTextResponse {
  id: number | null;
  category: string;
  category_label: string;
  content: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface RuleTextsResponse {
  shop_info: {
    id: number;
    name: string;
  };
  rule_texts: RuleTextResponse[];
  categories: {
    [key: string]: string;
  };
}

export interface AvailableCategoriesResponse {
  categories: {
    [key: string]: string;
  };
  category_keys: string[];
}

// ========================================
// メニュー関連レスポンス
// ========================================

export interface MenuResponse {
  id: number;
  shop_id: number;
  item_name: string;
  category: string;
  category_display: string;
  price: number;
  price_display: string;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  shop_name?: string;
}

export interface MenusResponse {
  shop_info: {
    id: number;
    name: string;
  };
  menus: MenuResponse[];
  summary: Array<{
    category: string;
    category_display: string;
    total_count: number;
    available_count: number;
  }>;
  categories: {
    [key: string]: string;
  };
}

// ========================================
// フリー雀荘関連レスポンス
// ========================================

export interface FreeResponse {
  id: number;
  shop_id: number;
  game_format: string;
  game_format_display: string;
  display_name: string;
  price: number;
  formatted_price: string;
  display_name_with_price: string;
  created_at: string;
  updated_at: string;
  shop_name?: string;
}

export interface FreesResponse {
  shop_info: {
    id: number;
    name: string;
  };
  frees: FreeResponse[];
  by_format: {
    three_player: FreeResponse | null;
    four_player: FreeResponse | null;
  };
  summary: {
    has_three_player: boolean;
    has_four_player: boolean;
    total_count: number;
  };
  game_formats: {
    [key: string]: string;
  };
}

// ========================================
// セット雀荘関連レスポンス
// ========================================

export interface SetResponse {
  id: number;
  shop_id: number;
  display_name: string;
  price: number;
  formatted_price: string;
  display_name_with_price: string;
  created_at: string;
  updated_at: string;
  shop_name?: string;
}

export interface ShopSetResponse {
  shop_info: {
    id: number;
    name: string;
  };
  has_set: boolean;
  set_data: SetResponse | null;
}

// ========================================
// ポータルサイト用API型（追加分）
// api.tsの最後に追加してください
// ========================================

// 都道府県関連
// ========================================

export interface PrefectureListResponse {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count: number;
}

export interface PrefectureDetailResponse {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count: number;
}

export interface PrefectureStationsResponse {
  type: 'group' | 'single';
  station_group_id?: number;
  station_id?: number;
  name: string;
  name_kana: string;
  slug: string;
  line_name?: string;
  shop_count: number;
}

export interface PrefectureCitiesResponse {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count: number;
}

// ========================================
// 市区町村関連
// ========================================

export interface CityDetailResponse {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  prefecture: {
    id: number;
    name: string;
    slug: string;
  };
  shop_count: number;
}

export interface CityShopsParams {
  sort_by?: 'created_at' | 'name';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// 市区町村内の駅情報
export interface CityStation {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  line_name: string | null;
  prefecture_slug: string;
  city_slug: string;
  shop_count: number;
}

// 市区町村内の駅一覧レスポンス
export interface CityStationsResponse {
  success: boolean;
  message: string;
  data: {
    city: {
      id: number;
      name: string;
      name_kana: string;
      slug: string;
      prefecture: {
        id: number;
        name: string;
        slug: string;
      };
    };
    stations: CityStation[];
    total: number;
  };
}

// ========================================
// 駅関連
// ========================================

export interface StationDetailResponse {
  type: 'group' | 'single';
  station_group_id?: number;
  station_id?: number;
  name: string;
  name_kana: string;
  slug: string;
  prefecture: {
    id: number;
    name: string;
    slug: string;
  };
  city: {
    id: number;
    name: string;
    slug: string;
  };
  lines?: Array<{
    station_id: number;
    line_id: number;
    line_name: string;
  }>;
  line?: {
    line_id: number;
    line_name: string;
  };
  shop_count: number;
}

export interface StationShopsParams {
  sort_by?: 'distance_km' | 'walking_minutes' | 'created_at' | 'name';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// 店舗の最寄り駅情報
export interface ShopNearestStation {
  id: number;
  name: string;
  slug: string;
  line_name: string;
  distance_km: number;
  walking_minutes: number;
}

// 周辺駅情報
export interface NearbyStation {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  line_name: string;
  prefecture_slug: string;
  distance_km: number;
  shop_count: number;
}

// 周辺駅一覧レスポンス
export interface NearbyStationsResponse {
  success: boolean;
  message: string;
  data: {
    current_station: {
      id: number;
      name: string;
      slug: string;
    };
    nearby_stations: NearbyStation[];
    total: number;
  };
}

// ========================================
// 検索関連
// ========================================

export interface SearchSuggestParams {
  q: string;
  prefecture?: string;
  limit?: number;
}

export interface SearchSuggestResponse {
  stations: Array<{
    type: 'station_group' | 'station_single';
    station_group_id?: number;
    station_id?: number;
    name: string;
    name_kana?: string;
    slug: string;
    line_name?: string;
    prefecture_name: string;
    prefecture_slug: string;
    shop_count: number;
    display_name: string;
  }>;
  cities: Array<{
    type: 'city';
    city_id: number;
    name: string;
    name_kana?: string;
    slug: string;
    prefecture_name: string;
    prefecture_slug: string;
    shop_count: number;
    display_name: string;
  }>;
}

// ========================================
// 店舗ブログ関連（追加）
// ========================================

export interface ShopBlogPostsParams {
  status?: 'PUBLISHED';
  sort_by?: 'published_at' | 'created_at';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface BusinessHoursResponse {
  shop_info: {
    id: number;
    name: string;
  };
  business_hours: Array<{
    day_of_week: number;
    day_name: string;
    is_closed: boolean;
    is_24h: boolean;
    open_time: string | null;
    close_time: string | null;
    note: string | null;
    display_text: string;
  }>;
  today_business_hour: {
    day_name: string;
    display_text: string;
    is_open_now: boolean;
  } | null;
}

export interface UpdateBusinessHoursRequest {
  business_hours: Array<{
    day_of_week: number;
    is_closed?: boolean;
    is_24h?: boolean;
    open_time?: string;
    close_time?: string;
    note?: string;
  }>;
}

export interface ShopFilterParams {
  // 営業形態
  has_three_player_free?: boolean;
  has_four_player_free?: boolean;
  has_set?: boolean;
  
  // 卓の種類
  auto_table?: boolean;
  score_table?: boolean;
  
  // ルール・特徴
  rules?: string[];
  features?: string[];
  
  // ソート・ページネーション
  sort_by?: 'created_at' | 'name' | 'distance_km' | 'walking_minutes';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// 都道府県の店舗検索パラメータ
export interface PrefectureShopsParams extends ShopFilterParams {
  cities?: number[]; // 市区町村IDの配列
}

// 市区町村の店舗検索パラメータ
export interface CityShopsParams extends ShopFilterParams {
  // 市区町村は既に確定しているので追加パラメータなし
}

// 駅の店舗検索パラメータ
export interface StationShopsParams extends ShopFilterParams {
  max_distance_km?: number; // 駅からの最大距離
}

// ========================================
// 雀荘サービス関連
// ========================================

export interface AvailableService {
  value: string;
  label: string;
}

export interface UpdateShopServicesRequest {
  service_types: string[];
}

export interface ShopServicesResponse {
  shop_info: {
    id: number;
    name: string;
  };
  summary: {
    total_services: number;
    categories_count: number;
    has_parking: boolean;
    has_food: boolean;
    has_free_wifi: boolean;
  };
  services_by_category: {
    [category: string]: {
      name: string;
      services: Array<{
        id: number;
        service_type: string;
        display_name: string;
        category: string;
        category_name: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
  all_services: Array<{
    id: number;
    service_type: string;
    display_name: string;
    category: string;
    category_name: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface AvailableServicesResponse {
  all_services: {
    [key: string]: string;
  };
  categorized_services: {
    [category: string]: {
      name: string;
      services: Array<{
        key: string;
        name: string;
      }>;
    };
  };
}