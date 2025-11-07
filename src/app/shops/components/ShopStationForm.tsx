// src/app/shops/components/ShopStationForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Train,
  Navigation,
  Clock,
  Plus,
  X,
  ArrowRight,
  Star,
} from "lucide-react";
import { ShopStationFormProps } from "@/types/form";
import { StationInfo, GroupedStationInfo } from "@/types/models";
import { searchStationsByName, getNearbyStations } from "@/lib/api/stations";
import { ErrorMessage } from "@/components/ui/error-message";

export default function ShopStationForm({
  mode = "create",
  value,
  addressCoordinates,
  onChange,
  onValidationChange,
  errors: externalErrors,
}: ShopStationFormProps) {
  const [selectionStep, setSelectionStep] = useState<"main" | "sub">("main");
  const [mainStation, setMainStation] = useState<StationInfo | null>(null);
  const [subStations, setSubStations] = useState<StationInfo[]>([]);
  const [nearbyStations, setNearbyStations] = useState<GroupedStationInfo[]>(
    []
  );
  const [searchResults, setSearchResults] = useState<GroupedStationInfo[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"nearby" | "manual">("nearby");

  const hasInitialized = useRef(false);

  const allErrors = { ...(error ? { general: error } : {}), ...externalErrors };

  // GroupedStationInfoをStationInfoに変換（保存用）
  const convertToStationInfo = (grouped: GroupedStationInfo): StationInfo => {
    // グループの代表駅（最初の路線）を使用
    const firstLine = grouped.lines[0];
    const allLines = grouped.lines.map((l) => l.line_name).join("、");

    return {
      id: firstLine.station_id,
      name: grouped.station_group_name || grouped.station_name || "",
      name_kana: grouped.name_kana,
      line_name: allLines,
      distance: grouped.distance,
      walking_time: grouped.walking_time,
      coordinates: grouped.coordinates,
      station_group: grouped.station_group_id
        ? {
            id: grouped.station_group_id,
            name: grouped.station_group_name || "",
          }
        : undefined,
    };
  };

  // 編集モード用の初期化処理
  useEffect(() => {
    if (hasInitialized.current) return;

    // valueが存在する場合（編集モードまたは新規登録で戻った場合）
    if (
      value &&
      (mode === "edit" || value.stations?.main || value.stations?.sub)
    ) {
      if (value.stations?.main) {
        setMainStation(value.stations.main);
        setSelectionStep("sub");
      }

      if (value.stations?.sub && value.stations.sub.length > 0) {
        setSubStations(value.stations.sub);
      }

      hasInitialized.current = true;

      if (onValidationChange) {
        const isValid =
          value.stations?.main !== null && value.stations?.main !== undefined;
        onValidationChange(isValid);
      }
    }
  }, [mode, value, onValidationChange]);

  // 住所座標が変更された時に近隣駅を自動検索
  useEffect(() => {
    if (
      addressCoordinates &&
      addressCoordinates.lat &&
      addressCoordinates.lng
    ) {
      if (mode === "edit" && mainStation) {
        return;
      }
      fetchNearbyStations(addressCoordinates.lat, addressCoordinates.lng);
    }
  }, [addressCoordinates?.lat, addressCoordinates?.lng]);

  // バリデーション更新
  const updateValidation = React.useCallback(
    (main: StationInfo | null, sub: StationInfo[]) => {
      const isValid = main !== null;

      const stationData = {
        nearest_station_id: main?.id || null,
        sub_station_ids: sub.map((s) => s.id),
        stations: {
          main: main || undefined,
          sub: sub,
        },
      };

      if (onValidationChange) {
        onValidationChange(isValid);
      }

      if (onChange) {
        onChange(stationData);
      }
    },
    [onChange, onValidationChange]
  );

  // 近隣駅取得API
  const fetchNearbyStations = async (lat: number, lng: number) => {
    setIsLoadingNearby(true);
    setError(null);

    try {
      const result = await getNearbyStations({
        lat,
        lng,
        max_stations: 10,
        max_distance: 3.0,
      });

      if (result.success && result.data?.length) {
        
        setNearbyStations(result.data);
        setSearchMode("nearby");
      } else {
        setNearbyStations([]);
        setSearchMode("manual");
      }
    } catch (err: any) {
      setError("近隣駅の取得に失敗しました。手動で検索してください");
      setNearbyStations([]);
      setSearchMode("manual");
    } finally {
      setIsLoadingNearby(false);
    }
  };

  // 駅名検索
  const handleSearchStations = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await searchStationsByName({ keyword, limit: 30 });

      if (result.success && result.data?.length) {
        // APIから既にグループ化済みのデータが返ってくる
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
        setError("該当する駅が見つかりませんでした");
      }
    } catch (err: any) {
      setError("駅の検索に失敗しました");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 検索キーワードの入力処理（デバウンス）
  useEffect(() => {
    if (searchKeyword.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleSearchStations(searchKeyword);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchKeyword]);

  // メイン駅選択処理
  const handleSelectMainStation = (groupedStation: GroupedStationInfo) => {
    const station = convertToStationInfo(groupedStation);
    setMainStation(station);
    setSelectionStep("sub");
    setError(null);
    updateValidation(station, subStations);
  };

  // サブ駅追加処理
  const handleAddSubStation = (groupedStation: GroupedStationInfo) => {
    const station = convertToStationInfo(groupedStation);

    if (
      mainStation &&
      station.station_group?.id &&
      mainStation.station_group?.id === station.station_group.id
    ) {
      setError("メイン駅と同じ駅は選択できません");
      return;
    }

    if (
      subStations.some(
        (s) =>
          s.station_group?.id &&
          station.station_group?.id &&
          s.station_group.id === station.station_group.id
      )
    ) {
      setError("既に選択済みの駅です");
      return;
    }

    if (subStations.length >= 3) {
      setError("サブ駅は最大3つまで選択できます");
      return;
    }

    const newSubStations = [...subStations, station];
    setSubStations(newSubStations);
    setError(null);
    updateValidation(mainStation, newSubStations);
  };

  // サブ駅削除処理
  const handleRemoveSubStation = (stationId: number) => {
    const newSubStations = subStations.filter((s) => s.id !== stationId);
    setSubStations(newSubStations);
    updateValidation(mainStation, newSubStations);
  };

  // メイン駅リセット
  const resetMainStation = () => {
    setMainStation(null);
    setSubStations([]);
    setSelectionStep("main");
    setError(null);
    updateValidation(null, []);

    if (
      addressCoordinates &&
      addressCoordinates.lat &&
      addressCoordinates.lng
    ) {
      fetchNearbyStations(addressCoordinates.lat, addressCoordinates.lng);
    }
  };

  // 利用可能な駅リスト（メイン駅とサブ駅を除外）
  const getAvailableStations = (): GroupedStationInfo[] => {
    const allStations =
      searchMode === "nearby" ? nearbyStations : searchResults;

    return allStations.filter((grouped) => {
      // メイン駅との比較
      // station_group_idで比較
      if (
        mainStation?.station_group?.id &&
        grouped.station_group_id === mainStation.station_group.id
      ) {
        return false;
      }
      // station_idで比較（グループ化されていない駅用）
      if (
        mainStation?.id &&
        grouped.lines &&
        grouped.lines.some((line) => line.station_id === mainStation.id)
      ) {
        return false;
      }

      // サブ駅との比較
      for (const subStation of subStations) {
        // station_group_idで比較
        if (
          subStation.station_group?.id &&
          grouped.station_group_id === subStation.station_group.id
        ) {
          return false;
        }
        // station_idで比較（グループ化されていない駅用）
        if (
          subStation.id &&
          grouped.lines &&
          grouped.lines.some((line) => line.station_id === subStation.id)
        ) {
          return false;
        }
      }

      return true;
    });
  };

  // 検索モード切り替え
  const switchToManualSearch = () => {
    setSearchMode("manual");
    setSearchKeyword("");
    setSearchResults([]);
  };

  const switchToNearbySearch = () => {
    setSearchMode("nearby");
    setSearchKeyword("");
    setSearchResults([]);

    if (
      addressCoordinates &&
      addressCoordinates.lat &&
      addressCoordinates.lng
    ) {
      fetchNearbyStations(addressCoordinates.lat, addressCoordinates.lng);
    }
  };

  // 距離表示のフォーマット
  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatWalkingTime = (walkingTime?: number) => {
    if (!walkingTime) return "";
    return `徒歩約${walkingTime}分`;
  };

  // UI: グループ化された駅表示カード
  const GroupedStationCard = ({
    station,
    onSelect,
  }: {
    station: GroupedStationInfo;
    onSelect?: () => void;
  }) => {
    const stationName =
      station.station_group_name || station.station_name || "";
    const allLines =
      station.lines && station.lines.length > 0
        ? station.lines.map((l) => l.line_name).join("、")
        : "";

    console.log("=== GroupedStationCard ===", {
      stationName,
      allLines,
      station,
    });

    return (
      <div
        className="border border-gray-200 rounded-lg p-3 transition-colors hover:bg-gray-50 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h5 className="text-sm font-medium text-gray-900">
                {stationName}
              </h5>
            </div>
            {allLines && (
              <p className="text-xs text-gray-600 mt-1">{allLines}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {station.distance && (
              <div className="text-right">
                <p className="text-xs text-orange-600 font-medium">
                  {formatDistance(station.distance)}
                </p>
                {station.walking_time && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatWalkingTime(station.walking_time)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // UI: 駅表示カード（選択済み用）
  const StationCard = ({
    station,
    onSelect,
    isMain = false,
    onRemove,
    selectable = true,
  }: {
    station: StationInfo;
    onSelect?: () => void;
    isMain?: boolean;
    onRemove?: () => void;
    selectable?: boolean;
  }) => (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        selectable
          ? "border-gray-200 hover:bg-gray-50 cursor-pointer"
          : isMain
          ? "border-orange-200 bg-orange-50"
          : "border-blue-200 bg-blue-50"
      }`}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {isMain && <Star className="w-4 h-4 text-orange-500 mr-1" />}
            <h5 className="text-sm font-medium text-gray-900">
              {station.name}
            </h5>
          </div>
          {station.line_name && (
            <p className="text-xs text-gray-600">{station.line_name}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {station.distance && (
            <div className="text-right">
              <p className="text-xs text-orange-600 font-medium">
                {formatDistance(station.distance)}
              </p>
              {station.walking_time && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatWalkingTime(station.walking_time)}
                </p>
              )}
            </div>
          )}

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 text-red-500 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">最寄り駅</h2>
        <p className="text-sm text-gray-600">
          メイン駅（必須）とサブ駅（最大3つ、任意）を選択してください。
        </p>
      </div>

      {/* ステップ表示 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${
                selectionStep === "main" ? "text-orange-600" : "text-green-600"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  mainStation
                    ? "bg-green-600 text-white"
                    : selectionStep === "main"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {mainStation ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <span className="ml-2 text-sm font-medium">メイン駅（必須）</span>
            </div>

            <ArrowRight className="w-4 h-4 text-gray-400" />

            <div
              className={`flex items-center ${
                selectionStep === "sub" ? "text-orange-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  selectionStep === "sub"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">
                サブ駅（任意・最大3つ）
              </span>
            </div>
          </div>
        </div>

        {/* 現在の選択状況 */}
        {mainStation && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                メイン駅
              </label>
              <StationCard
                station={mainStation}
                isMain={true}
                selectable={false}
              />
            </div>

            {subStations.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  サブ駅（{subStations.length}/3）
                </label>
                <div className="space-y-2">
                  {subStations.map((station) => (
                    <StationCard
                      key={station.id}
                      station={station}
                      selectable={false}
                      onRemove={() => handleRemoveSubStation(station.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={resetMainStation}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                駅選択をやり直す
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 住所座標がない場合の警告 */}
      {!addressCoordinates && !mainStation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                住所の入力が必要です
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                最寄り駅を自動検索するには、住所・位置情報の入力を完了してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* メイン駅選択 */}
      {selectionStep === "main" && !mainStation && addressCoordinates && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-orange-800 mb-2">
              🚉 STEP 1: メイン駅を選択
            </h4>
            <p className="text-xs text-orange-700">
              最も利用頻度の高い駅をメイン駅として選択してください。
            </p>
          </div>

          {/* 検索モード切り替え */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={switchToNearbySearch}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchMode === "nearby"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Navigation className="w-4 h-4 inline mr-1" />
              近隣駅から選択
            </button>
            <button
              onClick={switchToManualSearch}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchMode === "manual"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Search className="w-4 h-4 inline mr-1" />
              駅名で検索
            </button>
          </div>

          {/* 近隣駅表示 */}
          {searchMode === "nearby" && (
            <div className="space-y-4">
              {isLoadingNearby && (
                <div className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">近隣の駅を検索中...</p>
                </div>
              )}

              {!isLoadingNearby && nearbyStations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                    <Train className="w-4 h-4 mr-2" />
                    近隣の駅（{nearbyStations.length}件）
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {nearbyStations.map((station, index) => (
                      <GroupedStationCard
                        key={`${
                          station.station_group_id || station.station_id
                        }-${index}`}
                        station={station}
                        onSelect={() => handleSelectMainStation(station)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!isLoadingNearby && nearbyStations.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Train className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    近隣に駅が見つかりませんでした
                  </p>
                  <button
                    onClick={switchToManualSearch}
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                  >
                    駅名で検索する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 手動検索 */}
          {searchMode === "manual" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  駅名検索
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="例: 渋谷、新宿"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    maxLength={50}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500 absolute right-3 top-3" />
                  )}
                </div>
              </div>

              {/* 検索結果 */}
              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    検索結果（{searchResults.length}件）
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((station, index) => (
                      <GroupedStationCard
                        key={`search-${
                          station.station_group_id || station.station_id
                        }-${index}`}
                        station={station}
                        onSelect={() => handleSelectMainStation(station)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* サブ駅選択 */}
      {selectionStep === "sub" && mainStation && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              🚉 STEP 2: サブ駅を選択（任意）
            </h4>
            <p className="text-xs text-blue-700">
              お客様が利用する可能性のある駅を最大3つまで追加できます。スキップも可能です。
            </p>
            {subStations.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                現在 {subStations.length}/3 駅選択済み
              </p>
            )}
          </div>

          {subStations.length < 3 && (
            <div className="space-y-4">
              {/* 検索モード切り替え */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={switchToNearbySearch}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchMode === "nearby"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Navigation className="w-4 h-4 inline mr-1" />
                  近隣駅から選択
                </button>
                <button
                  onClick={switchToManualSearch}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchMode === "manual"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-1" />
                  駅名で検索
                </button>
              </div>

              {/* 利用可能な駅表示 */}
              {searchMode === "nearby" && !isLoadingNearby && (
                <div>
                  {getAvailableStations().length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        サブ駅として追加可能な駅
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {getAvailableStations().map((station, index) => (
                          <GroupedStationCard
                            key={`sub-${
                              station.station_group_id || station.station_id
                            }-${index}`}
                            station={station}
                            onSelect={() => handleAddSubStation(station)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        近隣の駅は全て選択済みです
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 手動検索（サブ駅用） */}
              {searchMode === "manual" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      駅名検索
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="例: 渋谷、新宿"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        maxLength={50}
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* 検索結果（サブ駅用） */}
                  {getAvailableStations().length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3">
                        追加可能な駅（{getAvailableStations().length}件）
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {getAvailableStations().map((station, index) => (
                          <GroupedStationCard
                            key={`sub-search-${
                              station.station_group_id || station.station_id
                            }-${index}`}
                            station={station}
                            onSelect={() => handleAddSubStation(station)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {subStations.length >= 3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800">
                サブ駅が最大数（3駅）選択されました
              </p>
            </div>
          )}
        </div>
      )}

      {/* エラー表示 */}
      {(error || allErrors.general) && (
        <ErrorMessage message={error || allErrors.general} />
      )}

      {/* 注意事項 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-orange-800 mb-2">
          💡 駅選択のポイント
        </h4>
        <ul className="text-xs text-orange-700 space-y-1">
          <li>
            • <strong>メイン駅</strong>: 最も利用頻度の高い駅（必須）
          </li>
          <li>
            • <strong>サブ駅</strong>:
            お客様が利用する可能性のある駅（任意・最大3つ）
          </li>
          <li>• 駅の設定は後から変更することも可能です</li>
          <li>• メイン駅とサブ駅に同じ駅は選択できません</li>
        </ul>
      </div>
    </div>
  );
}