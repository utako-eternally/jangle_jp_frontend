import { StationInfo, DayOfWeek } from './models';

// ========================================
// 店舗登録・編集フォーム関連
// ========================================

// 営業時間フォーム（追加）
export interface BusinessHourFormData {
  day_of_week: DayOfWeek;
  is_closed: boolean;
  is_24h: boolean;
  open_time: string;
  close_time: string;
}

// 基本情報フォーム（open_hoursを削除）
export interface ShopBasicInfoForm {
  name: string;
  phone?: string;
  website_url?: string;
  description?: string;
}

// 卓数フォーム
export interface ShopTableCountForm {
  table_count: number;
  score_table_count: number;
  auto_table_count: number;
}

// 営業形態フォーム
export interface ShopBusinessTypeForm {
  three_player_free: boolean;
  four_player_free: boolean;
  set: boolean;
}

// 住所フォーム
export interface ShopAddressForm {
  postal_code?: string;
  node_address_result?: {
    lat: number;
    lng: number;
    formatted_address: string;
    final_address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    address_details: {
      prefecture: string;
      city: string;
      town: string;
      street: string;
      building: string;
      postal_code: string;
    };
  };
  final_address?: string;
  final_lat?: number;
  final_lng?: number;
}

// 駅情報フォーム
export interface ShopStationForm {
  nearest_station_id: number | null;
  sub_station_ids: number[];
  stations: {
    main?: StationInfo;
    sub: StationInfo[];
  };
}

// 画像フォーム
export interface ShopImageForm {
  logo_image: File | null;
  cover_image: File | null;
}

// 統合フォームデータ（businessHoursを追加）
export interface ShopFormData {
  basicInfo: ShopBasicInfoForm;
  businessHours: BusinessHourFormData[]; // 追加
  tableCount: ShopTableCountForm;
  businessTypeData: ShopBusinessTypeForm;
  addressData: ShopAddressForm;
  stationData: ShopStationForm;
  imageData: ShopImageForm;
}

// フォームコンポーネント共通Props
export interface ShopBasicInfoFormProps {
  value: ShopBasicInfoForm;
  onChange: (data: ShopBasicInfoForm) => void;
  onValidationChange: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

// 営業時間フォームProps（追加）
export interface ShopBusinessHoursFormProps {
  value: BusinessHourFormData[];
  openHoursText?: string;
  onChange: (data: BusinessHourFormData[]) => void;
  onOpenHoursTextChange?: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

export interface ShopTableCountFormProps {
  mode?: 'create' | 'edit';
  value: ShopTableCountForm;
  onChange: (data: ShopTableCountForm) => void;
  onValidationChange: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

export interface ShopBusinessTypeFormProps {
  value: ShopBusinessTypeForm;
  onChange: (data: ShopBusinessTypeForm) => void;
  onValidationChange: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

export interface ShopAddressFormProps {
  mode?: 'create' | 'edit';
  value: ShopAddressForm;
  onChange: (data: ShopAddressForm) => void;
  onValidationChange: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

export interface ShopStationFormProps {
  mode?: 'create' | 'edit';
  value: ShopStationForm;
  addressCoordinates: { lat: number; lng: number } | null;
  onChange: (data: ShopStationForm) => void;
  onValidationChange: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

export interface ShopImageFormProps {
  value: ShopImageForm;
  onChange: (data: ShopImageForm) => void;
  onValidationChange: (isValid: boolean) => void;
  maxImages?: number;
  allowedTypes?: string[];
}

// ========================================
// 認証フォーム
// ========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
}

export interface CompleteRegistrationFormData {
  token: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
  nick_name?: string;
}

export interface EmailVerificationFormData {
  token: string;
}

// ========================================
// 雀荘フォーム
// ========================================

export interface ShopBasicInfoFormData {
  name: string;
  description: string;
  phone: string;
  website_url: string;
  table_count: number;
  score_table_count: number;
  auto_table_count: number;
}

export interface ShopAddressFormData {
  prefecture_id: number;
  city_id: number;
  postal_code?: string;
  address_pref: string;
  address_city: string;
  address_town: string;
  address_street: string;
  address_building: string;
}

export interface ShopStationsFormData {
  main_station_id: number;
  sub_station_ids: number[];
}

export interface ShopFeaturesFormData {
  features: string[];
}

export interface ShopRulesFormData {
  rules: string[];
}

// ========================================
// ブログフォーム
// ========================================

export interface BlogPostFormData {
  shop_id: number;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  published_at?: string | null;
}

// ========================================
// LINE設定フォーム
// ========================================

export interface LineSettingsFormData {
  line_official_id: string;
  line_add_url: string;
}

// ========================================
// フリー雀荘フォーム
// ========================================

export interface FreeCreateFormData {
  game_format: 'THREE_PLAYER' | 'FOUR_PLAYER';
}

export interface RateFormData {
  rate_label: string;
  internal_memo?: string;
  is_public: boolean;
  display_order: number;
}

export interface RatePriceFormData {
  [userType: string]: {
    price: number;
    details?: string;
  };
}

// ========================================
// セット雀荘フォーム
// ========================================

export interface SetBasePriceFormData {
  duration: 30 | 60;
  prices: {
    [userType: string]: {
      [dayType: string]: {
        price: number;
        enabled: boolean;
      };
    };
  };
}

export interface SetPackageFormData {
  name: string;
  duration: number | null;
  day_type: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
  details?: string;
}

export interface SetPackagePriceFormData {
  [userType: string]: {
    price: number;
    enabled: boolean;
  };
}

// ========================================
// ルール・メニューフォーム
// ========================================

export interface RuleTextsFormData {
  MAIN_RULES: string;
  PENALTY_RULES: string;
  MANNER_RULES: string;
}

export interface MenuFormData {
  category: 'FOOD' | 'DRINK' | 'ALCOHOL' | 'OTHER';
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  display_order: number;
}