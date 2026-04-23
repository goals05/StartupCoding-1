import React, { useState, useMemo, useEffect } from 'react';
import { Search, Map, Zap, User, LineChart, Heart, X, Trash2, MapPin } from 'lucide-react';
import Predictor from './components/Predictor';
import Optimizer from './components/Optimizer';
import NowFeed from './components/NowFeed';
import Login from './components/Login';
import MyPage from './components/MyPage';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PLACES } from './data/mockData';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type Tab = 'predictor' | 'optimizer' | 'now';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('predictor');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // Global Context for Location
  const [activeRegion, setActiveRegion] = useState<string | null>('서울 전체');
  const [activeProvince, setActiveProvince] = useState('전체');

  // Supabase Auth Listener
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        await fetchUserData(session.user.id);
      }
      setIsInitializing(false);
    };

    initializeAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setCurrentUser(session.user);
        await fetchUserData(session.user.id);
      } else {
        setCurrentUser(null);
        setFavorites([]);
        setActiveRegion('서울 전체');
        setActiveProvince('전체');
      }
      setIsInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found, create one
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ 
            id: userId, 
            favorites: [], 
            last_region: '서울 전체', 
            last_province: '전체' 
          }]);
        if (insertError) console.error("Error creating profile", insertError);
      } else if (data) {
        // Essential: Set favorites first, then other preferences
        if (data.favorites) setFavorites(data.favorites);
        if (data.last_region) setActiveRegion(data.last_region);
        if (data.last_province) setActiveProvince(data.last_province);
        console.log("User data loaded successfully:", data.favorites?.length, "favorites");
      }
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!currentUser) return;
    
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    
    setFavorites(newFavorites);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ favorites: newFavorites })
        .eq('id', currentUser.id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating favorites", error);
    }
  };

  // Sync Regional choice to Supabase for persistence
  useEffect(() => {
    if (currentUser && !isInitializing) {
      const updateLocation = async () => {
        try {
          await supabase
            .from('user_profiles')
            .update({ 
              last_region: activeRegion, 
              last_province: activeProvince 
            })
            .eq('id', currentUser.id);
        } catch (error) {
          console.error("Error updating location session", error);
        }
      }
      updateLocation();
    }
  }, [activeRegion, activeProvince, currentUser, isInitializing]);

  const favoritePlaces = useMemo(() => 
    MOCK_PLACES.filter(p => favorites.includes(p.id)),
  [favorites]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setActiveTab('predictor');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">로딩 중 (Supabase)...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">
              More than <span className="text-blue-600">Line</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavoritesOpen(true)}
              className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <Heart size={20} className={cn(favorites.length > 0 && "text-red-500 fill-red-500")} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {favorites.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMyPageOpen(true)}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all group"
            >
              <User size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'predictor' && (
              <Predictor 
                favorites={favorites} 
                toggleFavorite={toggleFavorite}
                activeRegion={activeRegion}
                setActiveRegion={setActiveRegion}
                activeProvince={activeProvince}
                setActiveProvince={setActiveProvince}
              />
            )}
            {activeTab === 'optimizer' && <Optimizer />}
            {activeTab === 'now' && (
              <NowFeed 
                favorites={favorites} 
                toggleFavorite={toggleFavorite}
                activeRegion={activeRegion}
                setActiveRegion={setActiveRegion}
                activeProvince={activeProvince}
                setActiveProvince={setActiveProvince}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Favorites Drawer */}
      <AnimatePresence>
        {isFavoritesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFavoritesOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart size={20} className="text-red-500 fill-red-500" /> 즐겨찾기
                </h2>
                <button 
                  onClick={() => setIsFavoritesOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {favoritePlaces.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Heart size={48} className="opacity-20" />
                    <p>저장된 장소가 없습니다.</p>
                  </div>
                ) : (
                  favoritePlaces.map(place => (
                    <div 
                      key={place.id}
                      className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3"
                    >
                      <img src={place.imageUrl} alt={place.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{place.name}</h4>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                          <MapPin size={10} /> {place.address}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(place.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-gray-100 px-6 py-3 pb-8 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <NavButton 
            active={activeTab === 'predictor'} 
            onClick={() => setActiveTab('predictor')}
            icon={<LineChart size={24} />}
            label="예측"
          />
          <NavButton 
            active={activeTab === 'optimizer'} 
            onClick={() => setActiveTab('optimizer')}
            icon={<Map size={24} />}
            label="최적화"
          />
          <NavButton 
            active={activeTab === 'now'} 
            onClick={() => setActiveTab('now')}
            icon={<Zap size={24} />}
            label="나우"
          />
        </div>
      </nav>

      {/* My Page Overlay */}
      <MyPage 
        isOpen={isMyPageOpen} 
        onClose={() => setIsMyPageOpen(false)} 
        onLogout={handleLogout}
        user={currentUser}
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative px-4",
        active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -top-3 left-0 right-0 h-1 bg-blue-600 rounded-full"
        />
      )}
      <div className={cn(
        "transition-transform duration-300",
        active ? "scale-110" : "scale-100"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
