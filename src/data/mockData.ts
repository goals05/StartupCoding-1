import { Place, CongestionData, RegionCongestion, CongestionLevel } from '../types';

const generateMockCongestion = (baseWait: number): CongestionData[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    let factor = 1;
    if (hour >= 11 && hour <= 14) factor = 2.5;
    if (hour >= 17 && hour <= 20) factor = 3;
    if (hour < 10 || hour > 22) factor = 0.3;
    
    return {
      time: hour,
      waitTime: Math.round(baseWait * factor * (0.8 + Math.random() * 0.4))
    };
  });
};

export const MOCK_REGIONS: RegionCongestion[] = [
  { id: 'r_seoul', name: '서울 전체', province: '서울', level: '혼잡', trend: 'rising', avgWaitTime: 38, populationDensity: 88, history: generateMockCongestion(32) },
  { id: 'r1', name: '용산구', province: '서울', level: '혼잡', trend: 'rising', avgWaitTime: 40, populationDensity: 85, history: generateMockCongestion(35) },
  { id: 'r2', name: '강남구', province: '서울', level: '매우혼잡', trend: 'stable', avgWaitTime: 50, populationDensity: 95, history: generateMockCongestion(45) },
  { id: 'r33', name: '성동구', province: '서울', level: '매우혼잡', trend: 'rising', avgWaitTime: 45, populationDensity: 90, history: generateMockCongestion(40) },
  { id: 'r34', name: '마포구', province: '서울', level: '혼잡', trend: 'rising', avgWaitTime: 35, populationDensity: 80, history: generateMockCongestion(30) },
  { id: 'r35', name: '종로구', province: '서울', level: '혼잡', trend: 'stable', avgWaitTime: 30, populationDensity: 75, history: generateMockCongestion(25) },
  { id: 'r36', name: '송파구', province: '서울', level: '혼잡', trend: 'rising', avgWaitTime: 40, populationDensity: 85, history: generateMockCongestion(35) },
  { id: 'r_gyeonggi', name: '경기 전체', province: '경기', level: '보통', trend: 'stable', avgWaitTime: 28, populationDensity: 65, history: generateMockCongestion(24) },
  { id: 'r8', name: '수원시', province: '경기', level: '보통', trend: 'rising', avgWaitTime: 25, populationDensity: 65, history: generateMockCongestion(22) },
  { id: 'r12', name: '용인시', province: '경기', level: '매우혼잡', trend: 'rising', avgWaitTime: 65, populationDensity: 88, history: generateMockCongestion(50) },
  { id: 'r37', name: '고양시', province: '경기', level: '혼잡', trend: 'stable', avgWaitTime: 35, populationDensity: 75, history: generateMockCongestion(30) },
  { id: 'r38', name: '파주시', province: '경기', level: '보통', trend: 'rising', avgWaitTime: 30, populationDensity: 60, history: generateMockCongestion(25) },
  { id: 'r39', name: '가평군', province: '경기', level: '혼잡', trend: 'rising', avgWaitTime: 45, populationDensity: 55, history: generateMockCongestion(40) },
  { id: 'r_gangwon', name: '강원 전체', province: '강원', level: '혼잡', trend: 'rising', avgWaitTime: 42, populationDensity: 75, history: generateMockCongestion(35) },
  { id: 'r14', name: '강릉시', province: '강원', level: '혼잡', trend: 'rising', avgWaitTime: 45, populationDensity: 70, history: generateMockCongestion(38) },
  { id: 'r15', name: '속초시', province: '강원', level: '혼잡', trend: 'stable', avgWaitTime: 40, populationDensity: 65, history: generateMockCongestion(35) },
  { id: 'r16', name: '양양군', province: '강원', level: '매우혼잡', trend: 'rising', avgWaitTime: 50, populationDensity: 80, history: generateMockCongestion(42) },
  { id: 'r40', name: '춘천시', province: '강원', level: '보통', trend: 'stable', avgWaitTime: 30, populationDensity: 65, history: generateMockCongestion(25) },
  { id: 'r23', name: '전주시', province: '전라', level: '매우혼잡', trend: 'rising', avgWaitTime: 60, populationDensity: 90, history: generateMockCongestion(55) },
  { id: 'r24', name: '여수시', province: '전라', level: '혼잡', trend: 'stable', avgWaitTime: 42, populationDensity: 70, history: generateMockCongestion(36) },
  { id: 'r41', name: '담양군', province: '전라', level: '보통', trend: 'rising', avgWaitTime: 25, populationDensity: 50, history: generateMockCongestion(20) },
  { id: 'r32', name: '경주시', province: '경상', level: '매우혼잡', trend: 'stable', avgWaitTime: 55, populationDensity: 85, history: generateMockCongestion(45) },
  { id: 'r6', name: '부산시', province: '경상', level: '혼잡', trend: 'rising', avgWaitTime: 40, populationDensity: 75, history: generateMockCongestion(35) },
  { id: 'r42', name: '울산시', province: '경상', level: '보통', trend: 'stable', avgWaitTime: 30, populationDensity: 65, history: generateMockCongestion(25) },
  { id: 'r7', name: '제주시', province: '제주', level: '보통', trend: 'stable', avgWaitTime: 25, populationDensity: 55, history: generateMockCongestion(20) },
  { id: 'r3', name: '대전시', province: '충청', level: '보통', trend: 'falling', avgWaitTime: 15, populationDensity: 45, history: generateMockCongestion(15) },
  { id: 'r20', name: '단양군', province: '충청', level: '혼잡', trend: 'stable', avgWaitTime: 35, populationDensity: 45, history: generateMockCongestion(30) },
  { id: 'r10', name: '인천 전체', province: '인천', level: '혼잡', trend: 'rising', avgWaitTime: 30, populationDensity: 70, history: generateMockCongestion(25) },
  { id: 'r11', name: '송도', province: '인천', level: '보통', trend: 'stable', avgWaitTime: 20, populationDensity: 60, history: generateMockCongestion(18) }
];

// REAL High-Traffic POIs based on SNS Trends (Instagram, Naver Blog)
export const MOCK_PLACES: Place[] = [
  // SEOUL - YONGSAN-GU (HANNAM/ITAECON)
  {
    id: 's1', name: '카페 노티드 한남', address: '서울 용산구 대사관로5길 12', category: '카페', rating: 4.5, currentCongestion: '매우혼잡', currentWaitTime: 45,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.534, lng: 127.001 }, congestionHistory: generateMockCongestion(25),
    openHours: { open: 11, close: 21 }, naverMapUrl: 'https://map.naver.com/v5/search/%EB%85%B8%ED%8B%B0%EB%93%9C%20%ED%95%9C%EB%82%A8'
  },
  {
    id: 's2', name: '올드페리도넛 한남본점', address: '서울 용산구 한남대로27길 66', category: '디저트', rating: 4.6, currentCongestion: '혼잡', currentWaitTime: 35,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.537, lng: 127.002 }, congestionHistory: generateMockCongestion(20),
    openHours: { open: 11, close: 21 }
  },
  {
    id: 's3', name: '다운타우너 한남', address: '서울 용산구 대사관로5길 12', category: '음식점', rating: 4.5, currentCongestion: '매우혼잡', currentWaitTime: 50,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.534, lng: 127.001 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 16 }
  },
  {
    id: 's4', name: '리움미술관', address: '서울 용산구 이태원로55길 60-16', category: '미술관', rating: 4.8, currentCongestion: '보통', currentWaitTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1518998053502-53cc8de79e98?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.538, lng: 126.999 }, congestionHistory: generateMockCongestion(15),
    openHours: { open: 10, close: 18 }
  },

  // SEOUL - GANGNAM-GU (SINSA/APGUJEONG)
  {
    id: 's6', name: '런던 베이글 뮤지엄 도산', address: '서울 강남구 언주로170길 28', category: '베이커리', rating: 4.8, currentCongestion: '매우혼잡', currentWaitTime: 180,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.527, lng: 127.036 }, congestionHistory: generateMockCongestion(100),
    openHours: { open: 8, close: 18 }
  },
  {
    id: 's7', name: '누데이크 하우스 도산', address: '서울 강남구 압구정로46길 50', category: '디저트', rating: 4.7, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.525, lng: 127.037 }, congestionHistory: generateMockCongestion(20),
    openHours: { open: 11, close: 21 }
  },
  {
    id: 's8', name: '카멜커피 도산점', address: '서울 강남구 도산대로45길 16-8', category: '카페', rating: 4.5, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.523, lng: 127.035 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 10, close: 21 }
  },

  // SEOUL - SEONGDONG-GU (SEONGSU)
  {
    id: 's9', name: '성수동 블루보틀', address: '서울 성동구 아차산로 7', category: '카페', rating: 4.6, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.548, lng: 127.044 }, congestionHistory: generateMockCongestion(20),
    openHours: { open: 8, close: 20 }
  },
  {
    id: 's10', name: '대림창고', address: '서울 성동구 성수이로 78', category: '카페/갤러리', rating: 4.4, currentCongestion: '혼잡', currentWaitTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.541, lng: 127.056 }, congestionHistory: generateMockCongestion(15),
    openHours: { open: 11, close: 22 }
  },
  {
    id: 's11', name: '성수 족발', address: '서울 성동구 아차산로7길 7', category: '음식점', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 90,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.544, lng: 127.052 }, congestionHistory: generateMockCongestion(60),
    openHours: { open: 12, close: 22 }
  },

  // SEOUL - MAPO-GU (HONGDAE/YEONNAM)
  {
    id: 's12', name: '랜디스도넛 연남점', address: '서울 마포구 동교로 247', category: '디저트', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.561, lng: 126.926 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 11, close: 21 }
  },
  {
    id: 's13', name: '하하 연남본점', address: '서울 마포구 동교로 263', category: '음식점', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 45,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.562, lng: 126.928 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 11, close: 21 }, breakTime: { start: 14, end: 17 }
  },

  // SEOUL - JONGNO-GU (IKSUN/AN GUK)
  {
    id: 's14', name: '청수당 익선', address: '서울 종로구 돈화문로11나길 31-9', category: '카페', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 70,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.574, lng: 126.990 }, congestionHistory: generateMockCongestion(50),
    openHours: { open: 11, close: 21 }
  },
  {
    id: 's15', name: '어니언 안국', address: '서울 종로구 계동길 5', category: '카페', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 90,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.579, lng: 126.985 }, congestionHistory: generateMockCongestion(60),
    openHours: { open: 7, close: 22 }
  },

  // SEOUL - SONGPA-GU (JAMSIL)
  {
    id: 's16', name: '진저베어 파이샵', address: '서울 송파구 백제고분로41길 43-7', category: '베이커리', rating: 4.8, currentCongestion: '매우혼잡', currentWaitTime: 120,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.509, lng: 127.108 }, congestionHistory: generateMockCongestion(80),
    openHours: { open: 12, close: 21 }
  },
  {
    id: 's17', name: '송리단길 초이다이닝', address: '서울 송파구 백제고분로45길 19', category: '음식점', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.511, lng: 127.106 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 17 }
  },

  // GYEONGGI - POPULAR SPOTS
  {
    id: 'g1', name: '행궁동 정조살롱', address: '경기 수원시 팔달구 화서문로 42', category: '카페', rating: 4.7, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.284, lng: 127.010 }, congestionHistory: generateMockCongestion(20),
    openHours: { open: 12, close: 22 }
  },
  {
    id: 'g2', name: '행궁동 운멜로', address: '경기 수원시 팔달구 화서문로 32', category: '음식점', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.285, lng: 127.011 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 16 }
  },
  {
    id: 'g3', name: '에버랜드 티익스프레스', address: '경기 용인시 처인구 포곡읍 에버랜드로 199', category: '테마파크', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 120,
    imageUrl: 'https://images.unsplash.com/photo-1513889959040-673d6e3a5ad8?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.293, lng: 127.203 }, congestionHistory: generateMockCongestion(100),
    openHours: { open: 10, close: 22 }
  },
  {
    id: 'g5', name: '파주 더티트렁크', address: '경기 파주시 지목로 114', category: '카페', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.712, lng: 126.695 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 9, close: 22 }
  },
  {
    id: 'g6', name: '가평 자라섬', address: '경기 가평군 가평읍 자라섬로 60', category: '관광지', rating: 4.6, currentCongestion: '보통', currentWaitTime: 0,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.821, lng: 127.514 }, congestionHistory: generateMockCongestion(10),
    openHours: { open: 0, close: 24 }
  },
  {
      id: 'g7', name: '고양 스타필드', address: '경기 고양시 덕양구 고양대로 1955', category: '쇼핑몰', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 60,
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400',
      coordinates: { lat: 37.646, lng: 126.895 }, congestionHistory: generateMockCongestion(50),
      openHours: { open: 10, close: 22 }
  },

  // GANGWON - TRENDING SPOTS
  {
    id: 'gw1', name: '테라로사 강릉본점', address: '강원 강릉시 구정면 현천길 25', category: '카페', rating: 4.7, currentCongestion: '혼잡', currentWaitTime: 45,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.701, lng: 128.908 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 9, close: 21 }
  },
  {
    id: 'gw2', name: '초당 동화가든', address: '강원 강릉시 초당순두부길 77번길 15', category: '음식점', rating: 4.9, currentCongestion: '매우혼잡', currentWaitTime: 120,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.791, lng: 128.915 }, congestionHistory: generateMockCongestion(60),
    openHours: { open: 7, close: 19 }, breakTime: { start: 16, end: 17 }
  },
  {
    id: 'gw6', name: '속초 청초수물회', address: '강원 속초시 엑스포로 12-36', category: '음식점', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 80,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 38.192, lng: 128.584 }, congestionHistory: generateMockCongestion(50),
    openHours: { open: 10, close: 21 }
  },
  {
    id: 'gw7', name: '속초 만석닭강정 중앙시장점', address: '강원 속초시 중앙로147번길 16', category: '음식점', rating: 4.8, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 38.204, lng: 128.591 }, congestionHistory: generateMockCongestion(20)
  },
  {
    id: 'gw8', name: '춘천 감자밭', address: '강원 춘천시 신북읍 신샘밭로 674', category: '카페', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 50,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.931, lng: 127.754 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 10, close: 20 }
  },
  {
    id: 'gw5', name: '양양 서피비치', address: '강원 양양군 현북면 하광정리 119-1', category: '해변/서핑', rating: 4.8, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.971, lng: 128.761 }, congestionHistory: generateMockCongestion(20),
    openHours: { open: 10, close: 24 }
  },

  // JEOLLA - POPULAR SPOTS
  {
    id: 'jl1', name: '전주 경기전', address: '전북 전주시 완산구 태조로 44', category: '역사유적', rating: 4.7, currentCongestion: '보통', currentWaitTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1547823645-030ef133082c?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.814, lng: 127.149 }, congestionHistory: generateMockCongestion(15),
    openHours: { open: 9, close: 19 }
  },
  {
    id: 'jl2', name: '전주 한국집', address: '전북 전주시 완산구 어진길 119', category: '음식점', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.816, lng: 127.152 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 16 }
  },
  {
    id: 'jl5', name: '전주 자만벽화마을', address: '전북 전주시 완산구 자만동2길', category: '관광지', rating: 4.6, currentCongestion: '보통', currentWaitTime: 0,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.814, lng: 127.158 }, congestionHistory: generateMockCongestion(5)
  },
  {
    id: 'jl3', name: '여수 낭만포차 44번', address: '전남 여수시 하멜로 102', category: '음식점', rating: 4.4, currentCongestion: '혼잡', currentWaitTime: 50,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 34.738, lng: 127.747 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 18, close: 2 }
  },
  {
    id: 'jl4', name: '여수 바다김밥', address: '전남 여수시 통제영5길 10-4', category: '음식점', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 90,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 34.741, lng: 127.734 }, congestionHistory: generateMockCongestion(50),
    openHours: { open: 8, close: 20 }
  },
  {
    id: 'jl6', name: '담양 국수거리 (진우네집)', address: '전남 담양군 담양읍 객사3길 32', category: '음식점', rating: 4.6, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.321, lng: 126.985 }, congestionHistory: generateMockCongestion(20)
  },

  // GYEONGSANG - POPULAR SPOTS
  {
    id: 'gs1', name: '해운대 상국이네', address: '부산 해운대구 중동1로 42-1', category: '분식', rating: 4.5, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.161, lng: 129.162 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 10, close: 2 }
  },
  {
    id: 'gs2', name: '해운대 랑데자뷰', address: '부산 해운대구 달맞이길62번길 23', category: '카페', rating: 4.6, currentCongestion: '보통', currentWaitTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.158, lng: 129.172 }, congestionHistory: generateMockCongestion(10),
    openHours: { open: 10, close: 22 }
  },
  {
    id: 'gs5', name: '부산 톤쇼우 광안점', address: '부산 수영구 광안해변로279번길 13', category: '음식점', rating: 4.9, currentCongestion: '매우혼잡', currentWaitTime: 180,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.154, lng: 129.118 }, congestionHistory: generateMockCongestion(120),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 17 }
  },
  {
    id: 'gs7', name: '부산 이재모피자 광복점', address: '부산 중구 광복중앙로 31', category: '음식점', rating: 4.8, currentCongestion: '매우혼잡', currentWaitTime: 90,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.102, lng: 129.031 }, congestionHistory: generateMockCongestion(60),
    openHours: { open: 11, close: 21 }
  },
  {
    id: 'gs8', name: '부산 해운대 빨간떡볶이', address: '부산 해운대구 우동1로 24', category: '음식점', rating: 4.6, currentCongestion: '혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.163, lng: 129.160 }, congestionHistory: generateMockCongestion(25)
  },
  {
    id: 'gs3', name: '황남아덴 (대릉원)', address: '경북 경주시 사정로 57', category: '카페', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.839, lng: 129.210 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 9, close: 22 }
  },
  {
    id: 'gs4', name: '경주 십원빵 본점', address: '경북 경주시 포석로 1083', category: '디저트', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.836, lng: 129.212 }, congestionHistory: generateMockCongestion(15),
    openHours: { open: 10, close: 21 }
  },
  {
    id: 'gs6', name: '울산 태화강 국가정원', address: '울산 중구 태화강국가정원길 154', category: '공원', rating: 4.8, currentCongestion: '보통', currentWaitTime: 0,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 35.549, lng: 129.301 }, congestionHistory: generateMockCongestion(5)
  },

  // CHUNGCHEONG - POPULAR SPOTS
  {
    id: 'ch1', name: '성심당 본점', address: '대전 중구 대종로480번길 15', category: '베이커리', rating: 4.9, currentCongestion: '매우혼잡', currentWaitTime: 80,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 36.327, lng: 127.427 }, congestionHistory: generateMockCongestion(60),
    openHours: { open: 8, close: 22 }
  },
  {
    id: 'ch3', name: '대전 성심당 케익부띠끄', address: '대전 중구 대종로 480', category: '디저트', rating: 4.8, currentCongestion: '혼잡', currentWaitTime: 40,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 36.328, lng: 127.426 }, congestionHistory: generateMockCongestion(30)
  },
  {
    id: 'ch2', name: '단양 카페산', address: '충북 단양군 가곡면 두산길 196-86', category: '카페', rating: 4.8, currentCongestion: '매우혼잡', currentWaitTime: 90,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 36.992, lng: 128.411 }, congestionHistory: generateMockCongestion(70),
    openHours: { open: 9, close: 19 }
  },

  // JEJU - POPULAR SPOTS
  {
    id: 'j1', name: '노티드 제주 애월', address: '제주 제주시 애월읍 애월로1길 24-9', category: '카페', rating: 4.5, currentCongestion: '매우혼잡', currentWaitTime: 150,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.465, lng: 126.311 }, congestionHistory: generateMockCongestion(100),
    openHours: { open: 10, close: 20 }
  },
  {
    id: 'j2', name: '서귀포 오는정김밥', address: '제주 서귀포시 동문로 2', category: '음식점', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 240,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.249, lng: 126.564 }, congestionHistory: generateMockCongestion(180),
    openHours: { open: 10, close: 20 }, breakTime: { start: 13, end: 14 }
  },
  {
    id: 'j5', name: '제주 숙성도 노형본점', address: '제주 제주시 원노형로 41', category: '음식점', rating: 4.8, currentCongestion: '매우혼잡', currentWaitTime: 150,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.486, lng: 126.488 }, congestionHistory: generateMockCongestion(120),
    openHours: { open: 11, close: 21 }, breakTime: { start: 15, end: 16 }
  },
  {
    id: 'j6', name: '제주 우진해장국', address: '제주 제주시 서사로 11', category: '음식점', rating: 4.7, currentCongestion: '매우혼잡', currentWaitTime: 120,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.511, lng: 126.520 }, congestionHistory: generateMockCongestion(90),
    openHours: { open: 6, close: 22 }
  },
  {
    id: 'j3', name: '제주 우무 (umu)', address: '제주 제주시 한림읍 한림로 542-1', category: '디저트', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.411, lng: 126.264 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 10, close: 19 }
  },
  {
    id: 'j4', name: '서귀포 유동커피', address: '제주 서귀포시 태평로 406-1', category: '카페', rating: 4.9, currentCongestion: '보통', currentWaitTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 33.245, lng: 126.561 }, congestionHistory: generateMockCongestion(10),
    openHours: { open: 8, close: 21 }
  },

  // INCHEON - SONGDO & GANGHWA
  {
    id: 'i1', name: '강화도 조양방직', address: '인천 강화군 강화읍 향나무길 5-1', category: '카페', rating: 4.6, currentCongestion: '매우혼잡', currentWaitTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.746, lng: 126.491 }, congestionHistory: generateMockCongestion(40),
    openHours: { open: 11, close: 20 }
  },
  {
    id: 'i2', name: '인천 차이나타운 연경', address: '인천 중구 차이나타운로 41', category: '음식점', rating: 4.4, currentCongestion: '혼잡', currentWaitTime: 45,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.476, lng: 126.618 }, congestionHistory: generateMockCongestion(30),
    openHours: { open: 10, close: 21 }
  },
  {
    id: 'i3', name: '송도 센트럴파크', address: '인천 연수구 컨벤시아대로 160', category: '공원', rating: 4.8, currentCongestion: '보통', currentWaitTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.391, lng: 126.639 }, congestionHistory: generateMockCongestion(10),
    openHours: { open: 0, close: 24 }
  },
  {
    id: 'i4', name: '영종도 C27 다운타운', address: '인천 중구 마시란로 63', category: '카페', rating: 4.5, currentCongestion: '혼잡', currentWaitTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    coordinates: { lat: 37.438, lng: 126.402 }, congestionHistory: generateMockCongestion(25),
    openHours: { open: 10, close: 21 }
  }
];
