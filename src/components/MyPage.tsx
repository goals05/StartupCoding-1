import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  LogOut, 
  UserMinus, 
  X, 
  Calendar,
  History,
  MessageSquare,
  PlusCircle,
  PenLine,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MOCK_PLACES } from '../data/mockData';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';

interface VisitRecord {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  imageUrl: string;
  visitedAt: string;
  content: string;
  createdAt: Timestamp;
}

interface MyPageProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: FirebaseUser | null;
}

const FAQS = [
  {
    question: "혼잡도 데이터는 얼마나 정확한가요?",
    answer: "모어댄라인의 AI 모델은 통신사 유동인구 데이터와 지자체 공공 데이터를 실시간으로 결합하여 92% 이상의 높은 예측 정확도를 제공합니다."
  },
  {
    question: "골든타임 추천은 어떤 기준인가요?",
    answer: "해당 장소의 과거 방문 이 패턴과 현재 실시간 유입 추세를 분석하여, 대기 시간이 최소화되는 가장 가까운 시간대를 AI가 계산하여 추천합니다."
  },
  {
    question: "방문 기록은 어떻게 저장되나요?",
    answer: "장소 상세 페이지나 마이페이지의 '기록하기' 기능을 통해 방문한 장소와 날짜를 클라우드에 안전하게 저장하고 나만의 여행 지도를 만들 수 있습니다."
  }
];

export default function MyPage({ isOpen, onClose, onLogout, user }: MyPageProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'faq' | 'privacy'>('main');
  const [visitedPlaces, setVisitedPlaces] = useState<VisitRecord[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [writeContent, setWriteContent] = useState('');
  const [selectedPlaceForRecord, setSelectedPlaceForRecord] = useState(MOCK_PLACES[0]);

  // Fetch from Firestore
  useEffect(() => {
    if (user && isOpen) {
      const q = query(
        collection(db, 'travel_records'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VisitRecord[];
        setVisitedPlaces(records);
      });

      return () => unsubscribe();
    }
  }, [user, isOpen]);

  const handleAddRecord = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'travel_records'), {
        userId: user.uid,
        placeId: selectedPlaceForRecord.id,
        placeName: selectedPlaceForRecord.name,
        imageUrl: selectedPlaceForRecord.imageUrl,
        content: writeContent,
        visitedAt: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      setIsWriteModalOpen(false);
      setWriteContent('');
    } catch (error) {
      console.error('Error saving record to Firebase:', error);
      alert('기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) {
      alert('회원 탈퇴가 완료되었습니다.');
      onLogout();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-10 bg-[#F8FAFC] z-[110] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.displayName || user?.email?.split('@')[0] || '사용자'}</h2>
                  <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeSection === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6 space-y-8"
                  >
                    {/* Travel History */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <History size={16} /> 나의 여행 기록
                        </h3>
                        <button 
                          onClick={() => setIsWriteModalOpen(true)}
                          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:scale-105 transition-transform bg-blue-50 px-3 py-1.5 rounded-full"
                        >
                          <PlusCircle size={14} /> 기록하기
                        </button>
                      </div>
                      <div className="space-y-3">
                        {visitedPlaces.length > 0 ? visitedPlaces.map((place, idx) => (
                          <div key={`${place.id}-${idx}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                              <img src={place.imageUrl} alt={place.placeName} className="w-16 h-16 rounded-2xl object-cover" />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{place.placeName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                    <Calendar size={10} /> {place.visitedAt ? new Date(place.visitedAt).toLocaleDateString() : '날짜 정보 없음'}
                                  </span>
                                  <span className="text-[10px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                    Checked-in
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="text-gray-300" size={18} />
                            </div>
                            {place.content && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl leading-relaxed italic">
                                "{place.content}"
                              </p>
                            )}
                          </div>
                        )) : (
                          <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                             <PenLine className="mx-auto mb-3 text-gray-300" size={32} />
                             <p className="text-sm text-gray-400 font-medium">아직 기록된 여행이 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Quick Menu */}
                    <div className="grid grid-cols-1 gap-3">
                      <MenuButton 
                        icon={<HelpCircle className="text-blue-500" />} 
                        label="자주 묻는 질문 (FAQ)" 
                        onClick={() => setActiveSection('faq')}
                      />
                      <MenuButton 
                        icon={<ShieldCheck className="text-emerald-500" />} 
                        label="개인정보 처리방침" 
                        onClick={() => setActiveSection('privacy')}
                      />
                    </div>

                    {/* Account Settings */}
                    <section className="pt-4 border-t border-gray-100 space-y-3">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">계정 설정</h3>
                      <button 
                        onClick={onLogout}
                        className="w-full p-5 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-red-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-gray-700 group-hover:text-red-600 font-bold">
                          <LogOut size={20} /> 로그아웃
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full p-5 bg-transparent rounded-3xl border border-dashed border-gray-200 flex items-center justify-between group hover:border-red-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-red-500 font-medium text-sm">
                          <UserMinus size={18} /> 회원 탈퇴
                        </div>
                      </button>
                    </section>
                  </motion.div>
                )}

                {activeSection === 'faq' && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    <button 
                      onClick={() => setActiveSection('main')}
                      className="text-sm font-bold text-blue-600 flex items-center gap-1"
                    >
                      ← 돌아가기
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                       <MessageSquare className="text-blue-500" /> 자주 묻는 질문
                    </h2>
                    <div className="space-y-4">
                      {FAQS.map((faq, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-2">Q. {faq.question}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">A. {faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    <button 
                      onClick={() => setActiveSection('main')}
                      className="text-sm font-bold text-blue-600 flex items-center gap-1"
                    >
                      ← 돌아가기
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-500" /> 개인정보 처리방침
                    </h2>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>당사는 서비스 제공을 위해 최소한의 개인정보만을 수집하며, 사용자의 동의 없이 제3자에게 제공하지 않습니다.</p>
                      <h4 className="font-bold text-gray-900 mt-4">1. 수집 항목</h4>
                      <p>이메일, 비밀번호, 서비스 이용 기록, 위치 정보(동의 시)</p>
                      <h4 className="font-bold text-gray-900 mt-4">2. 이용 목적</h4>
                      <p>본인 확인, 맞춤형 명소 추천, 장소 혼잡도 정확도 향상 및 서비스 통계 분석</p>
                      <h4 className="font-bold text-gray-900 mt-4">3. 보유 및 이용 기간</h4>
                      <p>회원 탈퇴 시 또는 목적 달성 후 지체 없이 파기합니다.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Write Record Modal */}
          <AnimatePresence>
            {isWriteModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsWriteModalOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white z-[210] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                       <PenLine className="text-blue-600" size={24} /> 여행 기록하기
                    </h3>
                    <button onClick={() => setIsWriteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Place Selection (Simplified) */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">방문한 장소 선택</label>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                          <img src={selectedPlaceForRecord.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-sm">{selectedPlaceForRecord.name}</div>
                            <div className="text-[10px] text-gray-500">{selectedPlaceForRecord.address}</div>
                          </div>
                          <button 
                            onClick={() => {
                              const next = MOCK_PLACES[(MOCK_PLACES.indexOf(selectedPlaceForRecord) + 1) % MOCK_PLACES.length];
                              setSelectedPlaceForRecord(next);
                            }}
                            className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm"
                          >
                            장소 변경
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 flex flex-col flex-1">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">여행의 한 줄 평</label>
                      <textarea
                        value={writeContent}
                        onChange={(e) => setWriteContent(e.target.value)}
                        placeholder="이곳에서의 추억을 한 줄로 남겨보세요..."
                        className="w-full flex-1 min-h-[150px] p-5 bg-gray-50 border-none rounded-[2rem] text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50">
                    <button
                      onClick={handleAddRecord}
                      disabled={isSubmitting || !writeContent.trim()}
                      className={cn(
                        "w-full py-4 bg-blue-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                        (isSubmitting || !writeContent.trim()) && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? "기록 저장 중..." : "추억 저장하기"}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-5 bg-white rounded-3xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
    >
      <div className="flex items-center gap-3 text-gray-900 font-bold">
        {icon}
        {label}
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}
