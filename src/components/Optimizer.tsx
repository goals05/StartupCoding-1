import React, { useState, useMemo } from 'react';
import { Plus, Trash2, MapPin, Navigation, Clock, ArrowRight, Sparkles, Info } from 'lucide-react';
import { MOCK_PLACES } from '../data/mockData';
import { Place, RouteStep } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Optimizer() {
  const [bucketList, setBucketList] = useState<Place[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStep[] | null>(null);
  const [transportMode, setTransportMode] = useState<'walk' | 'transit' | 'car'>('car');

  const addToBucket = (place: Place) => {
    if (bucketList.length >= 5) return;
    if (bucketList.find(p => p.id === place.id)) return;
    setBucketList([...bucketList, place]);
  };

  const removeFromBucket = (id: string) => {
    setBucketList(bucketList.filter(p => p.id !== id));
    setOptimizedRoute(null);
  };

  const handleOptimize = () => {
    if (bucketList.length < 2) return;
    setIsOptimizing(true);
    
    // Simulate optimization algorithm
    setTimeout(() => {
      const startTime = new Date();
      startTime.setHours(11, 0, 0); // Start at 11:00 AM

      let currentTime = new Date(startTime);
      const steps: RouteStep[] = bucketList.map((place, index) => {
        const waitTime = place.congestionHistory[currentTime.getHours()].waitTime;
        const travelTime = index === 0 ? 0 : 15 + Math.floor(Math.random() * 20);
        
        // Add travel time
        currentTime.setMinutes(currentTime.getMinutes() + travelTime);
        const arrival = new Date(currentTime);
        
        // Add wait time + stay time (fixed 60m for demo)
        currentTime.setMinutes(currentTime.getMinutes() + waitTime + 60);
        const departure = new Date(currentTime);

        return {
          placeId: place.id,
          arrivalTime: arrival.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          departureTime: departure.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          waitTime,
          travelTime
        };
      });

      setOptimizedRoute(steps);
      setIsOptimizing(false);
    }, 1500);
  };

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = Array.from(new Set(MOCK_PLACES.map(p => p.address.split(' ')[0])));

  const filteredRecommendations = MOCK_PLACES.filter(p => 
    !bucketList.find(b => b.id === p.id) && 
    (!selectedRegion || p.address.startsWith(selectedRegion))
  );

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="text-blue-500" size={20} /> 스마트 루트 플래너
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['car', 'transit', 'walk'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                  transportMode === mode 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" 
                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                )}
              >
                {mode === 'car' ? '자차' : mode === 'transit' ? '대중교통' : '도보'}
              </button>
            ))}
          </div>

          <div className="min-h-[100px] border-2 border-dashed border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 font-medium">버킷 리스트 (최대 5개)</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {bucketList.map(place => (
                  <motion.div
                    key={place.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-blue-100"
                  >
                    {place.name}
                    <button onClick={() => removeFromBucket(place.id)}>
                      <Trash2 size={14} className="hover:text-red-500 transition-colors" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {bucketList.length === 0 && (
                <p className="text-sm text-gray-400 italic">장소를 추가하여 최적의 경로를 찾아보세요.</p>
              )}
            </div>
          </div>

          <button
            disabled={bucketList.length < 2 || isOptimizing}
            onClick={handleOptimize}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2",
              bucketList.length < 2 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            )}
          >
            {isOptimizing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                최적화 중...
              </div>
            ) : (
              <>
                <Navigation size={20} /> 최적 경로 생성하기
              </>
            )}
          </button>
        </div>
      </div>

      {!optimizedRoute && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-900">추천 장소</h3>
            <select 
              value={selectedRegion || ''} 
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="text-xs bg-white border border-gray-100 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">전체 지역</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredRecommendations.map(place => (
              <button
                key={place.id}
                onClick={() => addToBucket(place)}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img src={place.imageUrl} alt={place.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{place.name}</div>
                    <div className="text-xs text-gray-500">{place.category} · {place.address.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Plus size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {optimizedRoute && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-900">최적화된 타임라인</h3>
            <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">
              대기 시간 45% 절약됨
            </div>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
            {optimizedRoute.map((step, index) => {
              const place = MOCK_PLACES.find(p => p.id === step.placeId)!;
              return (
                <motion.div
                  key={step.placeId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-600 z-10" />
                  
                  {/* Travel Time Indicator */}
                  {index > 0 && (
                    <div className="absolute -left-[32px] -top-8 text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      이동 {step.travelTime}분
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Step {index + 1}</span>
                        <h4 className="font-bold text-gray-900">{place.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{step.arrivalTime} 도착</div>
                        <div className="text-[10px] text-gray-400">{step.departureTime} 출발 예정</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <Clock size={12} /> 예상 대기 {step.waitTime}분
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Info size={12} /> 이용 시간 60분
                      </div>
                    </div>

                    {step.waitTime > 60 && (
                      <div className="mt-3 p-2 bg-red-50 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] text-red-600 font-bold">과혼잡 주의! 대안 장소 보기</span>
                        <ArrowRight size={12} className="text-red-600" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
