import React, { useState, useMemo } from 'react';
import { Search, Clock, TrendingUp, MapPin, Info, Sparkles, ChevronRight, Users, Heart, Coffee, User, AlertCircle, Zap, Moon, Coffee as CoffeeIcon, Map as MapIcon, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MOCK_PLACES, MOCK_REGIONS } from '../data/mockData';
import { Place, CongestionLevel, RegionCongestion } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const getCongestionColor = (level: CongestionLevel) => {
  switch (level) {
    case '여유': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    case '보통': return 'text-blue-500 bg-blue-50 border-blue-100';
    case '혼잡': return 'text-orange-500 bg-orange-50 border-orange-100';
    case '매우혼잡': return 'text-red-500 bg-red-50 border-red-100';
    default: return 'text-gray-500 bg-gray-50 border-gray-100';
  }
};

const getCongestionIcon = (level: CongestionLevel, size = 14) => {
  switch (level) {
    case '여유': return <Coffee size={size} />;
    case '보통': return <User size={size} />;
    case '혼잡': return <Users size={size} />;
    case '매우혼잡': return <AlertCircle size={size} />;
    default: return null;
  }
};

const getPlaceStatus = (place: Place, hour: number) => {
  if (!place.openHours) return { isOpen: true, type: 'open' };
  
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

const TRENDING_REGIONS = [
  { name: '서울 전체', icon: '🏰', province: '서울' },
  { name: '경기 전체', icon: '🏢', province: '경기' },
  { name: '인천 전체', icon: '⚓', province: '인천' },
  { name: '강원 전체', icon: '☕', province: '강원' },
  { name: '부산시', icon: '🌊', province: '경상' },
  { name: '전주시', icon: '🏮', province: '전라' },
  { name: '경주시', icon: '🏛️', province: '경상' },
  { name: '제주시', icon: '🌴', province: '제주' },
];

const PROVINCES = ['전체', '서울', '경기', '강원', '충청', '전라', '경상', '제주', '인천'];

export default function Predictor({ 
  favorites = [], 
  toggleFavorite = () => {},
  activeRegion,
  setActiveRegion,
  activeProvince,
  setActiveProvince
}: { 
  favorites?: string[], 
  toggleFavorite?: (id: string) => void,
  activeRegion: string | null,
  setActiveRegion: (region: string | null) => void,
  activeProvince: string,
  setActiveProvince: (province: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());

  const getPlaceCountForRegion = (regionName: string) => {
    if (regionName.includes('전체')) {
      const province = regionName.split(' ')[0];
      return MOCK_PLACES.filter(p => p.address.includes(province)).length;
    }
    const cleanName = regionName.replace('시', '').replace('군', '').replace('구', '').trim();
    return MOCK_PLACES.filter(p => p.address.includes(cleanName)).length;
  };

  const filteredRegions = useMemo(() => {
    if (activeProvince === '전체') return [];

    return MOCK_REGIONS.filter(r => r.province === activeProvince);
  }, [activeProvince]);

  const filteredPlaces = useMemo(() => {
    let places = MOCK_PLACES;
    if (searchQuery) {
      return places.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeRegion) {
      if (activeRegion.includes('전체') || activeRegion === '서울시') {
        // Show all places in that province
        const currentProvince = activeRegion.split(' ')[0];
        return places.filter(p => p.address.includes(currentProvince));
      }
      const cleanRegion = activeRegion.replace('시', '').replace('군', '').replace('구', '').trim();
      return places.filter(p => p.address.includes(cleanRegion));
    }
    return places;
  }, [searchQuery, activeRegion]);

  const currentRegionData = useMemo(() => {
    const regionName = activeRegion || '서울';
    return MOCK_REGIONS.find(r => r.name.includes(regionName)) || MOCK_REGIONS[0];
  }, [activeRegion]);

  const goldenTime = useMemo(() => {
    if (!selectedPlace) return null;
    const sorted = [...selectedPlace.congestionHistory].sort((a, b) => a.waitTime - b.waitTime);
    const best = sorted.find(h => h.time >= 10 && h.time <= 20);
    if (!best) return null;
    
    const currentWait = selectedPlace.currentWaitTime;
    const reduction = Math.round(((currentWait - best.waitTime) / currentWait) * 100);
    
    return {
      time: best.time,
      reduction: reduction > 0 ? reduction : 0
    };
  }, [selectedPlace]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-2xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="장소, 지역, 도시 검색 (예: 제주도, 해운대)"
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map(place => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <MapPin className="text-gray-400 mt-1 shrink-0" size={18} />
                    <div>
                      <div className="font-semibold text-gray-900">{place.name}</div>
                      <div className="text-sm text-gray-500">{place.address}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">검색 결과가 없습니다.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trending & Regional Filter */}
      {!searchQuery && !selectedPlace && (
        <div className="space-y-6">
          {/* Province Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {PROVINCES.map(province => (
              <button
                key={province}
                onClick={() => {
                  setActiveProvince(province);
                  if (province === '전체') {
                    setActiveRegion('서울 전체');
                  } else {
                    const firstRegion = MOCK_REGIONS.find(r => r.province === province);
                    if (firstRegion) setActiveRegion(firstRegion.name);
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                  activeProvince === province 
                    ? "bg-gray-900 border-gray-900 text-white shadow-lg" 
                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                )}
              >
                {province}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 px-1 uppercase tracking-wider">
              {activeProvince === '전체' ? '인기 지역' : `${activeProvince} 지역 선택`}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {(activeProvince === '전체' ? TRENDING_REGIONS : filteredRegions).map(region => {
                const count = getPlaceCountForRegion(region.name);
                return (
                  <button
                    key={region.name}
                    onClick={() => {
                      if ('province' in region && activeProvince === '전체') {
                        setActiveProvince(region.province);
                        setActiveRegion(region.name);
                      } else {
                        setActiveRegion(region.name);
                      }
                      setSelectedPlace(null);
                    }}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all",
                      activeRegion === region.name
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border-gray-100 text-gray-700 hover:border-blue-200"
                    )}
                  >
                    <span className="text-xl">{'icon' in region ? region.icon : '📍'}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm leading-none">{region.name}</div>
                      <div className={cn("text-[10px] mt-1", activeRegion === region.name ? "text-blue-100" : "text-gray-400")}>
                        {count > 0 ? `${count}개 명소` : '추천 명소 준비중'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Regional Congestion Card */}
      {!selectedPlace && currentRegionData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" /> {currentRegionData.name} 지역 혼잡도
            </h3>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border",
              getCongestionColor(currentRegionData.level)
            )}>
              {currentRegionData.level}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">평균 대기</div>
              <div className="text-lg font-bold text-gray-900">{currentRegionData.avgWaitTime}분</div>
            </div>
            <div className="text-center border-x border-gray-50">
              <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">유동 인구</div>
              <div className="text-lg font-bold text-gray-900">{currentRegionData.populationDensity}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">추세</div>
              <div className={cn(
                "text-lg font-bold",
                currentRegionData.trend === 'rising' ? 'text-red-500' : currentRegionData.trend === 'falling' ? 'text-emerald-500' : 'text-blue-500'
              )}>
                {currentRegionData.trend === 'rising' ? '상승' : currentRegionData.trend === 'falling' ? '하락' : '유지'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Place List or Selected Place Detail */}
      <AnimatePresence mode="wait">
        {!selectedPlace ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-gray-400 px-1 uppercase tracking-wider">
              {activeRegion} 추천 명소
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {filteredPlaces.map(place => (
                <div 
                  key={place.id}
                  className="bg-white rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all group overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedPlace(place)}
                    className="flex-1 p-4 flex items-center gap-4 text-left"
                  >
                    <img src={place.imageUrl} alt={place.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <div className="font-bold text-gray-900">{place.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{place.category} · {place.address.split(' ')[1]}</div>
                      <div className="flex items-center gap-2">
                        {getPlaceStatus(place, new Date().getHours()).isOpen ? (
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border",
                            getCongestionColor(place.currentCongestion)
                          )}>
                            {getCongestionIcon(place.currentCongestion)}
                            {place.currentCongestion} (대기 {place.currentWaitTime}분)
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-gray-50 text-gray-400 border-gray-100">
                            {getPlaceStatus(place, new Date().getHours()).type === 'closed' ? <Moon size={10} /> : <CoffeeIcon size={10} />}
                            {getPlaceStatus(place, new Date().getHours()).message}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="flex flex-col items-center justify-center p-2 gap-2 border-l border-gray-50">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(place.id);
                      }}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        favorites.includes(place.id) ? "text-red-500 bg-red-50" : "text-gray-300 hover:text-blue-500 hover:bg-gray-50"
                      )}
                    >
                      <Heart size={20} className={cn(favorites.includes(place.id) && "fill-red-500")} />
                    </button>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="text-sm font-bold text-blue-600 flex items-center gap-1 mb-2"
            >
              ← 목록으로 돌아가기
            </button>

            {/* Place Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <button 
                onClick={() => toggleFavorite(selectedPlace.id)}
                className={cn(
                  "absolute top-6 right-6 p-3 rounded-2xl border transition-all shadow-sm",
                  favorites.includes(selectedPlace.id) 
                    ? "text-red-500 bg-white border-red-100" 
                    : "text-gray-400 bg-white border-gray-100 hover:text-red-500 hover:border-red-100"
                )}
              >
                <Heart size={24} className={cn(favorites.includes(selectedPlace.id) && "fill-red-500")} />
              </button>
              <div className="flex justify-between items-start mb-4 pr-12">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedPlace.name}</h2>
                  <p className="text-gray-500 flex items-center gap-1 mb-2 text-sm">
                    <MapPin size={14} /> {selectedPlace.address}
                  </p>
                  
                  <div className="flex gap-2 mb-3">
                    <a 
                      href={selectedPlace.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(selectedPlace.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                    >
                      <MapIcon size={12} /> 네이버 지도에서 보기 <ExternalLink size={10} />
                    </a>
                  </div>

                  {selectedPlace.openHours && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {selectedPlace.openHours.open}:00 - {selectedPlace.openHours.close}:00
                      {selectedPlace.breakTime && ` (브레이크 ${selectedPlace.breakTime.start}:00 - ${selectedPlace.breakTime.end}:00)`}
                    </p>
                  )}
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-2",
                  !getPlaceStatus(selectedPlace, selectedHour).isOpen 
                    ? "bg-gray-50 text-gray-400 border-gray-100"
                    : getCongestionColor(selectedPlace.currentCongestion)
                )}>
                  {!getPlaceStatus(selectedPlace, selectedHour).isOpen ? (
                    <>
                      {getPlaceStatus(selectedPlace, selectedHour).type === 'closed' ? <Moon size={16} /> : <CoffeeIcon size={16} />}
                      {getPlaceStatus(selectedPlace, selectedHour).message}
                    </>
                  ) : (
                    <>
                      {getCongestionIcon(selectedPlace.currentCongestion, 16)}
                      {selectedPlace.currentCongestion}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "rounded-2xl p-4 transition-colors",
                  !getPlaceStatus(selectedPlace, selectedHour).isOpen ? "bg-gray-50 opacity-50" : "bg-gray-50"
                )}>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Clock size={14} /> {selectedHour === new Date().getHours() ? '현재 ' : `${selectedHour}시 `} 대기 시간
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {!getPlaceStatus(selectedPlace, selectedHour).isOpen ? '-' : (
                      selectedHour === new Date().getHours() 
                        ? <>{selectedPlace.currentWaitTime}<span className="text-sm font-normal ml-1">분</span></>
                        : <>{selectedPlace.congestionHistory[selectedHour].waitTime}<span className="text-sm font-normal ml-1">분</span></>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "rounded-2xl p-4 border transition-colors",
                  !getPlaceStatus(selectedPlace, selectedHour).isOpen ? "bg-gray-50 border-gray-100 opacity-50" : "bg-blue-50 border-blue-100"
                )}>
                  <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                    <TrendingUp size={14} /> 예측 추세
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {!getPlaceStatus(selectedPlace, selectedHour).isOpen ? '-' : (
                      selectedPlace.congestionHistory[selectedHour].waitTime > selectedPlace.currentWaitTime ? '상승' : '하락'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Golden Time Banner */}
            {goldenTime && goldenTime.reduction > 0 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white flex items-center gap-4 shadow-lg shadow-blue-500/20"
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">AI 골든타임 추천</p>
                  <p className="font-bold">
                    {goldenTime.time}시에 방문 시 대기 시간이 <span className="text-yellow-300">{goldenTime.reduction}%</span> 감소합니다.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Congestion Graph */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" /> 시간대별 예상 대기
                </h3>
                <div className="text-sm text-gray-500">단위: 분</div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedPlace.congestionHistory}>
                    <defs>
                      <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(val) => `${val}시`}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 'dataMax + 20']}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">{payload[0].payload.time}시 예상</p>
                              <p className="text-lg font-bold text-blue-600">{payload[0].value}분</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="waitTime" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWait)" 
                      animationDuration={1500}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.time === selectedHour) {
                          return (
                            <g key="pulsing-dot">
                              <circle cx={cx} cy={cy} r={6} fill="#3b82f6" fillOpacity={0.3}>
                                <animate attributeName="r" from="6" to="12" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                              </circle>
                              <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
                            </g>
                          );
                        }
                        return <circle key={`dot-${payload.time}`} cx={cx} cy={cy} r={0} />;
                      }}
                    />
                    <ReferenceLine x={selectedHour} stroke="#3b82f6" strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Timeline Slider */}
              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>예측 시간 설정</span>
                  <span className="text-blue-600 font-bold">{selectedHour}시</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  step="1"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
