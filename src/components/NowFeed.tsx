import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, Star, Clock, Bell, SlidersHorizontal, Heart, Coffee, User, Users, AlertCircle, Moon, Coffee as CoffeeIcon, ChevronDown, X, Search, Globe, LocateFixed } from 'lucide-react';
import { MOCK_PLACES, MOCK_REGIONS } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CongestionLevel, Place } from '../types';

const PROVINCES = ['전체', '서울', '경기', '강원', '충청', '전라', '경상', '제주', '인천'];

// Haversine formula to calculate distance in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

const getCongestionColor = (level: CongestionLevel) => {
  switch (level) {
    case '여유': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    case '보통': return 'text-blue-500 bg-blue-50 border-blue-100';
    case '혼잡': return 'text-orange-500 bg-orange-50 border-orange-100';
    case '매우혼잡': return 'text-red-500 bg-red-50 border-red-100';
    default: return 'text-gray-500 bg-gray-50 border-gray-100';
  }
};

const getCongestionIcon = (level: CongestionLevel, size = 12) => {
  switch (level) {
    case '여유': return <Coffee size={size} />;
    case '보통': return <User size={size} />;
    case '혼잡': return <Users size={size} />;
    case '매우혼잡': return <AlertCircle size={size} />;
    default: return null;
  }
};

const getPlaceStatus = (place: Place, hour: number) => {
  if (!place.openHours) return { isOpen: true, type: 'open', message: '영업 중' };
  
  const { open, close } = place.openHours;
  const isBusinessHours = close > open 
    ? (hour >= open && hour < close)
    : (hour >= open || hour < close);
    
  if (!isBusinessHours) return { isOpen: false, type: 'closed', message: '영업 종료' };
  
  if (place.breakTime) {
    const { start, end } = place.breakTime;
    if (hour >= start && hour < end) return { isOpen: false, type: 'break', message: '브레이크 타임' };
  }
  
  return { isOpen: true, type: 'open', message: '영업 중' };
};

export default function NowFeed({ 
  favorites = [], 
  toggleFavorite = () => {},
  activeRegion = '서울 전체',
  setActiveRegion = () => {},
  activeProvince = '전체',
  setActiveProvince = () => {}
}: { 
  favorites?: string[], 
  toggleFavorite?: (id: string) => void,
  activeRegion?: string | null,
  setActiveRegion?: (region: string | null) => void,
  activeProvince?: string,
  setActiveProvince?: (province: string) => void
}) {
  const [radius, setRadius] = useState(1000); // meters
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUseGPS(true);
        setActiveRegion('내 주변 (실시간)');
        setIsLocating(false);
        setIsLocationPickerOpen(false);
      },
      (error) => {
        console.error('위치 정보를 가져오는데 실패했습니다:', error);
        alert('위치 정보 접근 권한을 허용해주세요.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const filteredRegionsForPicker = useMemo(() => {
    let regions = MOCK_REGIONS;
    if (activeProvince !== '전체') {
      regions = regions.filter(r => r.province === activeProvince);
    }
    if (regionSearch) {
      regions = regions.filter(r => r.name.includes(regionSearch));
    }
    return regions;
  }, [activeProvince, regionSearch]);

  const relaxedPlaces = useMemo(() => {
    let places = MOCK_PLACES.filter(p => p.currentCongestion === '여유' || p.currentCongestion === '보통');
    
    // Calculate distance for all places if GPS is available
    const processedPlaces = places.map(p => {
      let distance = null;
      if (userLocation && p.coordinates) {
        distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          p.coordinates.lat, 
          p.coordinates.lng
        );
      }
      return { ...p, distance };
    });

    let results = processedPlaces;

    if (useGPS && userLocation) {
      // Filter by radius when using GPS
      results = processedPlaces.filter(p => p.distance !== null && p.distance <= radius);
    } else if (activeRegion) {
      if (activeRegion.includes('전체')) {
        const province = activeRegion.split(' ')[0];
        results = processedPlaces.filter(p => p.address.includes(province));
      } else {
        const cleanRegion = activeRegion.replace('시', '').replace('군', '').replace('구', '').trim();
        results = processedPlaces.filter(p => p.address.includes(cleanRegion));
      }
    }

    // Sorting
    if (sortBy === 'distance' && userLocation) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }
    
    return results;
  }, [activeRegion, userLocation, useGPS, radius, sortBy]);

  // Find a busy place in the current region for the alert
  const busyPlaceInRegion = useMemo(() => {
    if (!activeRegion) return null;
    
    if (useGPS && userLocation) {
      return MOCK_PLACES.find(p => {
        if (!p.coordinates) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng);
        return dist <= radius && (p.currentCongestion === '매우혼잡' || p.currentCongestion === '혼잡');
      });
    }

    const province = activeRegion.split(' ')[0];
    const cleanRegion = activeRegion.replace('시', '').replace('군', '').replace('구', '').trim();
    
    return MOCK_PLACES.find(p => 
      (activeRegion.includes('전체') ? p.address.includes(province) : p.address.includes(cleanRegion)) && 
      (p.currentCongestion === '매우혼잡' || p.currentCongestion === '혼잡')
    );
  }, [activeRegion, useGPS, userLocation, radius]);

  const nearbyRecommendation = useMemo(() => {
    if (!activeRegion) return null;
    return relaxedPlaces[0] || MOCK_PLACES.find(p => p.currentCongestion === '여유');
  }, [activeRegion, relaxedPlaces]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-2xl mx-auto">
      {/* Location Selector */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin size={16} />
            <span className="text-sm font-medium">현재 설정된 지역</span>
          </div>
          <button 
            onClick={() => setIsLocationPickerOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
          >
            지역 변경 <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-gray-900">
              {activeRegion?.replace(' 전체', '') || '전국'}
            </h2>
            <span className="text-xs text-gray-400 font-medium">주변 나우 피드</span>
          </div>
          {useGPS && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black animate-pulse shadow-lg shadow-blue-100">
              <LocateFixed size={12} /> LIVE GPS
            </div>
          )}
        </div>
      </div>

      {/* Radius & Header Settings */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-emerald-500 animate-pulse" size={20} /> 실시간 '나우' 피드
          </h2>
          <button className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>주변 반경 설정</span>
            <span className="text-emerald-600 font-bold">
              {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 px-1">
            <span>500m</span>
            <span>1km</span>
            <span>3km</span>
            <span>5km</span>
          </div>
        </div>
      </div>

      {/* GPS Permission Prompt if not active */}
      {!useGPS && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <LocateFixed size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-1 flex items-center gap-2">
               <MapPin size={20} /> 실시간 내 위치 반영하기
            </h3>
            <p className="text-blue-50 text-xs mb-4 leading-relaxed opacity-90">
              위치 정보 승인 후 반경 {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`} 이내의<br/>
              가장 여유롭고 쾌적한 장소를 실시간으로 추천해 드립니다.
            </p>
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-6 py-3 bg-white text-blue-600 rounded-2xl text-sm font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLocating ? '위치 확인 중...' : '현재 위치 사용 승인'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Smart Alert Simulation */}
      {busyPlaceInRegion && nearbyRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0">
            <Navigation size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-900">Smart Alert: 우회 경로 제안</p>
            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
              현재 {useGPS ? '주변 반경 내' : `계신 ${activeRegion?.replace(' 전체', '')}`}의 <b>'{busyPlaceInRegion.name}'</b>이 현재 <b>{busyPlaceInRegion.currentCongestion}</b> 상태입니다. 
              {nearbyRecommendation && (
                <> 근처의 여유로운 <b>'{nearbyRecommendation.name}'</b>은 어떠신가요?</>
              )}
            </p>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-900">현재 여유로운 주변 장소</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setSortBy('distance')}
              className={cn("text-xs font-bold px-2 py-1 rounded-lg transition-all", sortBy === 'distance' ? "bg-emerald-100 text-emerald-700" : "text-gray-400 hover:bg-gray-50")}
            >
              거리순
            </button>
            <button 
              onClick={() => setSortBy('rating')}
              className={cn("text-xs font-bold px-2 py-1 rounded-lg transition-all", sortBy === 'rating' ? "bg-emerald-100 text-emerald-700" : "text-gray-400 hover:bg-gray-50")}
            >
              별점순
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {relaxedPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
            >
              <div className="relative h-40">
                <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {getPlaceStatus(place, new Date().getHours()).isOpen ? (
                    <div className={cn(
                      "backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm text-center flex items-center gap-1.5 border",
                      getCongestionColor(place.currentCongestion)
                    )}>
                      {getCongestionIcon(place.currentCongestion)}
                      {place.currentCongestion}
                    </div>
                  ) : (
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm text-center flex items-center gap-1.5">
                      {getPlaceStatus(place, new Date().getHours()).type === 'closed' ? <Moon size={12} /> : <CoffeeIcon size={12} />}
                      {getPlaceStatus(place, new Date().getHours()).message}
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(place.id);
                    }}
                    className={cn(
                      "p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all text-center",
                      favorites.includes(place.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    )}
                  >
                    <Heart size={18} className={cn(favorites.includes(place.id) && "fill-red-500")} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {place.rating}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-gray-900 truncate">{place.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                      <MapPin size={12} /> {place.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {getPlaceStatus(place, new Date().getHours()).isOpen ? (
                      <>
                        <div className="text-sm font-bold text-emerald-600">대기 {place.currentWaitTime}분</div>
                        <div className="text-[10px] text-gray-400">
                          {place.distance 
                            ? (place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance / 1000).toFixed(1)}km`)
                            : (index === 0 ? '450m' : index === 1 ? '1.2km' : '2.5km') // fallback for mock
                          }
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-bold text-gray-400">-</div>
                    )}
                  </div>
                </div>
                <button className="w-full mt-3 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                  <Navigation size={16} /> 길찾기
                </button>
              </div>
            </motion.div>
          ))}
          {relaxedPlaces.length === 0 && (
            <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
              <Search size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium">선택한 조건에 맞는 여유로운 장소가 없습니다.</p>
              <p className="text-[10px] mt-1 opacity-70">반경 설정을 넓혀보세요.</p>
            </div>
          )}
        </div>
      </div>
      {/* Location Picker Modal */}
      <AnimatePresence>
        {isLocationPickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationPickerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white z-[110] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" /> 지역 설정
                  </h3>
                  <button 
                    onClick={() => setIsLocationPickerOpen(false)}
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  <button
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all border-2",
                      useGPS 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <LocateFixed size={16} /> 
                    {isLocating ? '확인 중...' : '내 주변 (GPS)'}
                  </button>
                  {PROVINCES.map((province) => (
                    <button
                      key={province}
                      onClick={() => {
                        setActiveProvince(province);
                        setUseGPS(false);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
                        activeProvince === province && !useGPS
                          ? "bg-gray-800 border-gray-800 text-white" 
                          : "bg-white border-gray-50 text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      {province}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="도시 또는 지역 검색"
                    value={regionSearch}
                    onChange={(e) => {
                      setRegionSearch(e.target.value);
                      if (e.target.value) setUseGPS(false);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  {filteredRegionsForPicker.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setActiveRegion(region.name);
                        setUseGPS(false);
                        setIsLocationPickerOpen(false);
                      }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                        activeRegion === region.name && !useGPS
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20"
                          : "bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50 shadow-sm"
                      )}
                    >
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {region.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 pb-1 uppercase tracking-wider font-bold">
                        {region.province}
                      </div>
                      {activeRegion === region.name && !useGPS && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                           <Clock size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {filteredRegionsForPicker.length === 0 && (
                  <div className="py-20 text-center text-gray-400">
                    <Search size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-black text-gray-700">탐색 반경 설정 ({radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`})</div>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-2 font-black">
                  <span>500m</span>
                  <span>1km</span>
                  <span>3km</span>
                  <span>5km</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
