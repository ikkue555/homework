import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  UserCheck, 
  Share2, 
  Search, 
  Check, 
  Clock, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  Flame,
  Swords,
  Zap,
  Crown,
  Globe2,
  Atom,
  Scroll,
  Star,
  ArrowLeft,
  ArrowRight,
  Send,
  Layers,
  Sparkle
} from 'lucide-react';
import { Friend, FriendRequest, Homework, UserProfile, SiteSettings } from '../types';
import { searchUsers } from '../lib/firebase';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  homeworks: Homework[];
  preselectedHomework?: Homework | null;
  siteSettings?: SiteSettings | null;
  onSendFriendRequest: (targetUser: UserProfile) => Promise<void>;
  onDirectAddFriend: (targetUser: UserProfile) => Promise<void>;
  onAcceptRequest: (request: FriendRequest) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onRemoveFriend: (friendUid: string) => Promise<void>;
  onShareHomework: (homeworkOrList: Homework | Homework[], targetFriends: Friend[]) => Promise<void>;
}

type TabType = 'friends' | 'share' | 'add' | 'requests';
type ShareStep = 'SELECT_CARDS' | 'SELECT_FRIENDS';
type ElementFilterType = 'ALL' | 'FIRE' | 'THUNDER' | 'WATER' | 'NATURE' | 'ARCANE' | 'COSMIC';

// Game Card Elemental Themes
interface ElementTheme {
  name: string;
  element: 'FIRE' | 'THUNDER' | 'WATER' | 'NATURE' | 'ARCANE' | 'COSMIC';
  icon: any;
  cardBorder: string;
  cardGlow: string;
  selectedGlow: string;
  rgbBorderGradient: string;
  glowShadow: string;
  foilGradient: string;
  bannerBg: string;
  orbBg: string;
  badgeBg: string;
  textColor: string;
  accentColor: string;
  elementSymbol: string;
}

const ELEMENT_THEMES: Record<string, ElementTheme> = {
  fire: {
    name: 'เพลิงคำนวณ (Fire)',
    element: 'FIRE',
    icon: Flame,
    cardBorder: 'border-rose-500/60 dark:border-rose-500/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(244,63,94,0.8),0_0_70px_rgba(251,146,60,0.4)]',
    rgbBorderGradient: 'from-rose-500 via-amber-400 via-orange-500 to-red-500',
    glowShadow: 'shadow-[0_0_30px_rgba(244,63,94,0.7),0_0_60px_rgba(251,146,60,0.35)]',
    foilGradient: 'from-rose-600 via-orange-500 to-amber-400',
    bannerBg: 'bg-gradient-to-r from-rose-950/80 via-slate-900/80 to-rose-950/80 border-rose-500/30 text-rose-200',
    orbBg: 'bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-rose-500/40',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    textColor: 'text-rose-400',
    accentColor: '#f43f5e',
    elementSymbol: '🔥',
  },
  electric: {
    name: 'สายฟ้ารหัส (Thunder)',
    element: 'THUNDER',
    icon: Zap,
    cardBorder: 'border-amber-400/60 dark:border-amber-400/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(245,158,11,0.8),0_0_70px_rgba(6,182,212,0.4)]',
    rgbBorderGradient: 'from-amber-400 via-yellow-200 via-cyan-400 to-amber-500',
    glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.7),0_0_60px_rgba(6,182,212,0.35)]',
    foilGradient: 'from-amber-500 via-yellow-300 to-orange-500',
    bannerBg: 'bg-gradient-to-r from-amber-950/80 via-slate-900/80 to-amber-950/80 border-amber-400/30 text-amber-200',
    orbBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-400/40',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    textColor: 'text-amber-400',
    accentColor: '#f59e0b',
    elementSymbol: '⚡',
  },
  water: {
    name: 'สมุทรพหุภาษา (Water)',
    element: 'WATER',
    icon: Globe2,
    cardBorder: 'border-cyan-400/60 dark:border-cyan-400/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(6,182,212,0.8),0_0_70px_rgba(59,130,246,0.4)]',
    rgbBorderGradient: 'from-cyan-400 via-sky-300 via-blue-500 to-teal-400',
    glowShadow: 'shadow-[0_0_30px_rgba(6,182,212,0.7),0_0_60px_rgba(59,130,246,0.35)]',
    foilGradient: 'from-cyan-500 via-sky-400 to-blue-600',
    bannerBg: 'bg-gradient-to-r from-cyan-950/80 via-slate-900/80 to-cyan-950/80 border-cyan-400/30 text-cyan-200',
    orbBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-400/40',
    badgeBg: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
    textColor: 'text-cyan-400',
    accentColor: '#06b6d4',
    elementSymbol: '💧',
  },
  nature: {
    name: 'พฤกษาพฤติกรรม (Nature)',
    element: 'NATURE',
    icon: Atom,
    cardBorder: 'border-emerald-400/60 dark:border-emerald-400/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(16,185,129,0.8),0_0_70px_rgba(132,204,22,0.4)]',
    rgbBorderGradient: 'from-emerald-400 via-lime-300 via-teal-400 to-green-500',
    glowShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.7),0_0_60px_rgba(132,204,22,0.35)]',
    foilGradient: 'from-emerald-500 via-teal-400 to-lime-500',
    bannerBg: 'bg-gradient-to-r from-emerald-950/80 via-slate-900/80 to-emerald-950/80 border-emerald-400/30 text-emerald-200',
    orbBg: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-400/40',
    badgeBg: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    textColor: 'text-emerald-400',
    accentColor: '#10b981',
    elementSymbol: '🌿',
  },
  arcane: {
    name: 'มนตราประวัติศาสตร์ (Arcane)',
    element: 'ARCANE',
    icon: Scroll,
    cardBorder: 'border-purple-400/60 dark:border-purple-400/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(168,85,247,0.8),0_0_70px_rgba(217,70,239,0.4)]',
    rgbBorderGradient: 'from-purple-500 via-fuchsia-400 via-indigo-400 to-violet-600',
    glowShadow: 'shadow-[0_0_30px_rgba(168,85,247,0.7),0_0_60px_rgba(217,70,239,0.35)]',
    foilGradient: 'from-purple-500 via-fuchsia-400 to-indigo-600',
    bannerBg: 'bg-gradient-to-r from-purple-950/80 via-slate-900/80 to-purple-950/80 border-purple-400/30 text-purple-200',
    orbBg: 'bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-purple-400/40',
    badgeBg: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
    textColor: 'text-purple-400',
    accentColor: '#a855f7',
    elementSymbol: '🔮',
  },
  celestial: {
    name: 'สุริยันศักดิ์สิทธิ์ (Celestial)',
    element: 'COSMIC',
    icon: Crown,
    cardBorder: 'border-yellow-400/60 dark:border-yellow-300/80',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.35)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(234,179,8,0.8),0_0_70px_rgba(168,85,247,0.4)]',
    rgbBorderGradient: 'from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 via-indigo-500 to-fuchsia-500',
    glowShadow: 'shadow-[0_0_30px_rgba(234,179,8,0.7),0_0_60px_rgba(168,85,247,0.35)]',
    foilGradient: 'from-amber-400 via-yellow-200 to-yellow-500',
    bannerBg: 'bg-gradient-to-r from-amber-950/80 via-slate-900/80 to-amber-950/80 border-yellow-400/30 text-yellow-200',
    orbBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-slate-950 shadow-yellow-400/40',
    badgeBg: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
    textColor: 'text-yellow-400',
    accentColor: '#eab308',
    elementSymbol: '✨',
  }
};

function getCardTheme(subject: string, priority?: string): ElementTheme {
  const sub = (subject || '').toLowerCase();
  
  if (sub.includes('คณิต') || sub.includes('math') || sub.includes('แคล') || priority === 'ด่วนที่สุด') {
    return ELEMENT_THEMES.fire;
  }
  if (sub.includes('ฟิสิกส์') || sub.includes('คอม') || sub.includes('วิศว') || sub.includes('เทคโน') || sub.includes('code')) {
    return ELEMENT_THEMES.electric;
  }
  if (sub.includes('อังกฤษ') || sub.includes('eng') || sub.includes('จีน') || sub.includes('ญี่ปุ่น') || sub.includes('ภาษาต่าง')) {
    return ELEMENT_THEMES.water;
  }
  if (sub.includes('ชีว') || sub.includes('เคมี') || sub.includes('วิทย์') || sub.includes('สุขศึกษา') || sub.includes('พละ')) {
    return ELEMENT_THEMES.nature;
  }
  if (sub.includes('ไทย') || sub.includes('สังคม') || sub.includes('ประวัติ') || sub.includes('ศิลปะ') || sub.includes('ดนตรี') || sub.includes('แนะแนว')) {
    return ELEMENT_THEMES.arcane;
  }
  
  return ELEMENT_THEMES.celestial;
}

// Calculate Card Rarity tier based on priority and difficulty
function getRarityInfo(hw: Homework) {
  if (hw.priority === 'ด่วนที่สุด') {
    return {
      code: 'UR',
      title: 'ULTRA RARE',
      stars: 5,
      badgeClass: 'bg-gradient-to-r from-rose-500 via-amber-400 to-purple-600 text-white font-black shadow-rose-500/40',
    };
  }
  if (hw.priority === 'สำคัญ' || hw.workType === 'กลุ่ม') {
    return {
      code: 'SSR',
      title: 'SUPER SPECIAL RARE',
      stars: 4,
      badgeClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 text-slate-950 font-black shadow-amber-500/40',
    };
  }
  return {
    code: 'SR',
    title: 'SUPER RARE',
    stars: 3,
    badgeClass: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white font-bold shadow-cyan-500/40',
  };
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  friends,
  incomingRequests,
  outgoingRequests,
  homeworks,
  preselectedHomework,
  siteSettings,
  onSendFriendRequest,
  onDirectAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onShareHomework,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => preselectedHomework ? 'share' : 'friends');
  const [shareStep, setShareStep] = useState<ShareStep>('SELECT_CARDS');

  // Search in Friends list
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // Add friend tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Share homework tab states - Multi-selection supported!
  const [selectedHwIds, setSelectedHwIds] = useState<string[]>(() => 
    preselectedHomework ? [preselectedHomework.id] : []
  );
  const [hwSearchFilter, setHwSearchFilter] = useState('');
  const [hwElementFilter, setHwElementFilter] = useState<ElementFilterType>('ALL');
  const [selectedFriendUids, setSelectedFriendUids] = useState<string[]>([]);
  const [shareFriendSearch, setShareFriendSearch] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  // Set selected homework when preselectedHomework changes or modal opens
  useEffect(() => {
    if (preselectedHomework) {
      setSelectedHwIds(prev => prev.includes(preselectedHomework.id) ? prev : [preselectedHomework.id, ...prev]);
      setActiveTab('share');
      setShareStep('SELECT_CARDS');
    }
  }, [preselectedHomework, isOpen]);

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friends;
    const q = friendSearchQuery.toLowerCase().trim();
    return friends.filter(f => 
      (f.displayName || '').toLowerCase().includes(q) || 
      (f.username || '').toLowerCase().includes(q) || 
      (f.email || '').toLowerCase().includes(q)
    );
  }, [friends, friendSearchQuery]);

  // Filtered friends list specifically in Step 2 of Sharing
  const filteredShareFriends = useMemo(() => {
    if (!shareFriendSearch.trim()) return friends;
    const q = shareFriendSearch.toLowerCase().trim();
    return friends.filter(f => 
      (f.displayName || '').toLowerCase().includes(q) || 
      (f.username || '').toLowerCase().includes(q) || 
      (f.email || '').toLowerCase().includes(q)
    );
  }, [friends, shareFriendSearch]);

  // Filtered Homeworks list for Game Card Deck sharing - Sorted by latest added date (createdAt)
  const filteredHomeworks = useMemo(() => {
    return (homeworks || [])
      .filter(hw => {
        if (!hw) return false;

        // Element filter
        if (hwElementFilter !== 'ALL') {
          const theme = getCardTheme(hw.subject, hw.priority);
          if (theme.element !== hwElementFilter) return false;
        }

        // Search keyword filter
        if (hwSearchFilter.trim()) {
          const q = hwSearchFilter.toLowerCase().trim();
          const matchSubject = (hw.subject || '').toLowerCase().includes(q);
          const matchTitle = (hw.title || '').toLowerCase().includes(q);
          const matchDesc = (hw.description || '').toLowerCase().includes(q);
          if (!matchSubject && !matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA; // Newest / latest added date first
        }
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [homeworks, hwElementFilter, hwSearchFilter]);

  // Selected homeworks objects - also sorted by latest added date
  const selectedHomeworkObjects = useMemo(() => {
    return (homeworks || [])
      .filter(h => selectedHwIds.includes(h.id))
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [homeworks, selectedHwIds]);

  if (!isOpen) return null;

  // Toggle Homework selection
  const handleToggleHwSelect = (hwId: string) => {
    setSelectedHwIds(prev => 
      prev.includes(hwId) ? prev.filter(id => id !== hwId) : [...prev, hwId]
    );
  };

  // Select all filtered homeworks
  const handleSelectAllHomeworks = () => {
    const filteredIds = filteredHomeworks.map(h => h.id);
    const allSelected = filteredIds.every(id => selectedHwIds.includes(id));

    if (allSelected) {
      setSelectedHwIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedHwIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Handle Search Users
  const handleSearchUsers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchUsers(searchQuery, currentUser.uid);
      setSearchResults(results);
    } catch (err) {
      console.error('Search users error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Check if a user is already a friend
  const isFriend = (uid: string) => friends.some(f => f.uid === uid);

  // Check if a request was sent to a user
  const isPendingOutgoing = (uid: string) => outgoingRequests.some(r => r.toUid === uid && r.status === 'pending');

  // Check if a request was received from a user
  const incomingReqFrom = (uid: string) => incomingRequests.find(r => r.fromUid === uid && r.status === 'pending');

  // Handle Add / Connect Friend
  const handleAddFriendClick = async (user: UserProfile) => {
    setActionLoadingId(user.uid);
    try {
      await onDirectAddFriend(user);
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการเพิ่มเพื่อน');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle friend selection for sharing
  const toggleFriendSelect = (uid: string) => {
    setSelectedFriendUids(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // Select all friends for sharing
  const handleSelectAllFriends = () => {
    const visibleUids = filteredShareFriends.map(f => f.uid);
    const allVisibleSelected = visibleUids.every(uid => selectedFriendUids.includes(uid));

    if (allVisibleSelected) {
      setSelectedFriendUids(prev => prev.filter(uid => !visibleUids.includes(uid)));
    } else {
      setSelectedFriendUids(prev => Array.from(new Set([...prev, ...visibleUids])));
    }
  };

  // Handle Submit Share Homework
  const handleExecuteShare = async () => {
    if (selectedHwIds.length === 0) {
      alert('กรุณาเลือกการบ้านที่ต้องการแชร์อย่างน้อย 1 วิชา');
      setShareStep('SELECT_CARDS');
      return;
    }
    if (selectedFriendUids.length === 0) {
      alert('กรุณาเลือกเพื่อนที่จะรับการบ้านอย่างน้อย 1 คน');
      return;
    }

    const targetFriends = friends.filter(f => selectedFriendUids.includes(f.uid));
    setIsSharing(true);
    setShareSuccessMessage(null);

    try {
      await onShareHomework(selectedHomeworkObjects, targetFriends);
      setShareSuccessMessage(`แชร์การบ้าน ${selectedHomeworkObjects.length} วิชา ให้เพื่อน ${targetFriends.length} คนสำเร็จเรียบร้อย! 🎉`);
      setSelectedFriendUids([]);
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการแชร์การบ้าน');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* FULLSCREEN TOP NAVIGATION BAR */}
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0 shadow-lg backdrop-blur-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-lg font-black font-heading text-white tracking-wide truncate">
                ระบบเพื่อน & แชร์การ์ดการบ้าน 3D
              </h2>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>FULLSCREEN DECK</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              เลือกการ์ดการบ้านเต็มหน้าจอ แล้วส่งต่อให้เพื่อนเพื่อเริ่มบันทึกความคืบหน้าแยกอิสระ
            </p>
          </div>
        </div>

        {/* Global Action & Close */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-700"
            title="ปิดหน้าต่างเต็มจอ"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">ปิด</span>
          </button>
        </div>
      </header>

      {/* FULLSCREEN TABS BAR */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/60 px-4 sm:px-6 pt-2 gap-1.5 overflow-x-auto shrink-0">
        <button
          onClick={() => {
            setActiveTab('share');
            setShareSuccessMessage(null);
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-black font-heading transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'share'
              ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border-t-2 border-x border-amber-400 border-b-0 bg-slate-900 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Swords className="w-4 h-4 text-amber-400" />
          <span>{siteSettings?.friendsTabShare || 'แชร์การบ้าน (สำรับการ์ด)'}</span>
          {selectedHwIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {selectedHwIds.length} ใบ
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('friends');
            setShareSuccessMessage(null);
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'friends'
              ? 'bg-sky-950/60 text-sky-300 border-t-2 border-x border-sky-400 border-b-0 bg-slate-900 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>{siteSettings?.friendsTabFriends || 'เพื่อนของฉัน'} ({friends.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('add');
            setShareSuccessMessage(null);
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'add'
              ? 'bg-emerald-950/60 text-emerald-300 border-t-2 border-x border-emerald-400 border-b-0 bg-slate-900 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>{siteSettings?.friendsTabAdd || 'เพิ่มเพื่อน'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('requests');
            setShareSuccessMessage(null);
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap relative ${
            activeTab === 'requests'
              ? 'bg-amber-950/60 text-amber-300 border-t-2 border-x border-amber-400 border-b-0 bg-slate-900 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>{siteSettings?.friendsTabRequests || 'คำขอเป็นเพื่อน'} ({incomingRequests.length})</span>
          {incomingRequests.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* FULLSCREEN CONTENT BODY */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
        
        {/* ========================================================================= */}
        {/* TAB 1: SHARE HOMEWORK - 2-STEP FLOW (FULLSCREEN CARDS -> SELECT FRIENDS) */}
        {/* ========================================================================= */}
        {activeTab === 'share' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: FULLSCREEN 3D CARD SELECTION (เรียงเต็มหน้าจอ 100%) */}
            {/* ------------------------------------------------------------- */}
            {shareStep === 'SELECT_CARDS' && (
              <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                {/* Top Control Bar: Search, Element Filters & Batch Select */}
                <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 shrink-0 space-y-3 shadow-md backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Step Title Badge */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black font-heading">
                        <span>ขั้นตอนที่ 1/2</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-white">เลือกการ์ดการบ้านที่ต้องการแชร์</span>
                      </div>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        (เลือกแล้ว <strong className="text-amber-400 font-bold">{selectedHwIds.length}</strong> จาก {homeworks.length} ใบ)
                      </span>
                    </div>

                    {/* Batch Select Controls */}
                    {homeworks.length > 0 && (
                      <div className="flex items-center space-x-2 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={handleSelectAllHomeworks}
                          className="text-xs text-amber-300 hover:text-amber-200 font-bold font-heading flex items-center space-x-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all shadow-xs"
                        >
                          {filteredHomeworks.every(h => selectedHwIds.includes(h.id)) && filteredHomeworks.length > 0 ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-amber-400" />
                              <span>ยกเลิกเลือกทั้งหมด</span>
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                              <span>เลือกทั้งหมดในหน้านี้ ({filteredHomeworks.length} ใบ)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filter & Search Bar */}
                  {homeworks.length > 0 && (
                    <div className="flex flex-col lg:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="ค้นหาการ์ดตามชื่อวิชา, หัวข้องาน, หรือรายละเอียด..."
                          value={hwSearchFilter}
                          onChange={(e) => setHwSearchFilter(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
                        />
                      </div>

                      {/* Elemental Filter Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                        {[
                          { id: 'ALL', label: 'ทั้งหมด', icon: Swords },
                          { id: 'FIRE', label: '🔥 เพลิง', icon: Flame },
                          { id: 'THUNDER', label: '⚡ สายฟ้า', icon: Zap },
                          { id: 'WATER', label: '💧 สมุทร', icon: Globe2 },
                          { id: 'NATURE', label: '🌿 พฤกษา', icon: Atom },
                          { id: 'ARCANE', label: '🔮 มนตรา', icon: Scroll },
                          { id: 'COSMIC', label: '✨ สุริยัน', icon: Crown },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setHwElementFilter(tab.id as ElementFilterType)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                              hwElementFilter === tab.id
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-md'
                                : 'bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:bg-slate-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* FULLSCREEN 3D CARDS DECK GRID (100% Fullscreen Width) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                  {homeworks.length === 0 ? (
                    <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-center">
                      <Swords className="w-16 h-16 text-slate-700 mb-3 animate-float" />
                      <h4 className="text-base font-bold text-slate-200 font-heading">
                        ยังไม่มีการ์ดการบ้านในสำรับ
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        กรุณากดเพิ่มการบ้านในหน้าหลัก เพื่อสร้างการ์ดใบใหม่ในสำรับของคุณ
                      </p>
                    </div>
                  ) : filteredHomeworks.length === 0 ? (
                    <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-center">
                      <p className="text-sm font-bold text-slate-300 font-heading">
                        ไม่พบการ์ดตรงตามคำค้นหา "{hwSearchFilter}"
                      </p>
                      <button
                        onClick={() => {
                          setHwSearchFilter('');
                          setHwElementFilter('ALL');
                        }}
                        className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        ล้างตัวกรองทั้งหมด
                      </button>
                    </div>
                  ) : (
                    /* Modern Clean 3D Game Cards Grid spanning entire screen */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 pb-24">
                      {filteredHomeworks.map((hw) => {
                        const isSelected = selectedHwIds.includes(hw.id);
                        const theme = getCardTheme(hw.subject, hw.priority);
                        const rarity = getRarityInfo(hw);
                        const ElementIcon = theme.icon;

                        return (
                          <div key={hw.id} className="relative group/card select-none">
                            {/* Dynamic Animated RGB Outer Aura Glow when selected */}
                            {isSelected && (
                              <div 
                                className={`absolute -inset-1 rounded-[28px] bg-gradient-to-r ${theme.rgbBorderGradient} animate-rgb-flow-fast opacity-75 blur-md pointer-events-none animate-aura-pulse`}
                              />
                            )}

                            {/* Modern Clean Card Canvas */}
                            <div
                              onClick={() => handleToggleHwSelect(hw.id)}
                              className={`relative rounded-3xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none ${
                                isSelected 
                                  ? `p-[2px] bg-gradient-to-r ${theme.rgbBorderGradient} animate-rgb-flow-fast transform -translate-y-2 scale-[1.02] ${theme.glowShadow} z-10` 
                                  : `border border-slate-800/90 bg-slate-900/90 hover:border-slate-600 ${theme.cardGlow} hover:-translate-y-1.5`
                              }`}
                              style={{ minHeight: '320px' }}
                            >
                              <div className={`w-full h-full flex flex-col justify-between rounded-[22px] overflow-hidden relative ${isSelected ? 'bg-slate-950' : 'bg-slate-900/95'}`}>
                                
                                {/* Holographic light sweep sheen across surface */}
                                {isSelected && (
                                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px] z-20">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-holo-sweep" />
                                  </div>
                                )}

                                {/* Card Header: Element Icon Badge (Icon Only) + Rarity Stars & Checkbox */}
                                <div className={`p-2.5 border-b ${theme.bannerBg} flex items-center justify-between text-xs font-black tracking-wider relative z-10 backdrop-blur-sm`}>
                                  {/* Left: Icon-Only Element Badge */}
                                  <div className="flex items-center space-x-1.5">
                                    <div 
                                      className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-950/70 border border-white/10 shadow-xs backdrop-blur-md"
                                      title={theme.name}
                                    >
                                      <span className="text-sm">{theme.elementSymbol}</span>
                                    </div>
                                  </div>

                                  {/* Right: Rarity Stars & Dynamic Selection Check */}
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] tracking-wider uppercase font-heading ${rarity.badgeClass}`}>
                                      {rarity.code}
                                    </span>

                                    {isSelected ? (
                                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-xs animate-scaleUp">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-lg flex items-center justify-center border border-slate-700 bg-slate-800/80 group-hover:border-slate-500 transition-colors">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Card Body: Main Artwork Orb + Subject Badge + Title + Clean Notes */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                                  <div className="space-y-2.5">
                                    {/* Subject Orb & Star Power */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className={`w-11 h-11 rounded-2xl ${theme.orbBg} flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform ${isSelected ? 'ring-2 ring-white/60' : ''}`}>
                                        <ElementIcon className="w-5 h-5 text-inherit" />
                                      </div>

                                      <div className="flex items-center space-x-0.5 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800/60">
                                        {Array.from({ length: rarity.stars }).map((_, i) => (
                                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        ))}
                                      </div>
                                    </div>

                                    {/* Card Title & Subject Badge */}
                                    <div>
                                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border ${theme.badgeBg} inline-block mb-1.5 font-heading tracking-wide`}>
                                        {hw.subject}
                                      </span>
                                      <h4 className={`font-bold text-sm sm:text-base line-clamp-2 font-heading transition-colors leading-snug ${
                                        isSelected ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-white group-hover:text-amber-300'
                                      }`}>
                                        {hw.title || hw.description.slice(0, 40) || 'เควสการบ้าน'}
                                      </h4>
                                    </div>

                                    {/* Description Box (Clean & Minimal) */}
                                    {hw.description && (
                                      <p className={`text-[11px] line-clamp-2 leading-relaxed p-2.5 rounded-xl border transition-colors ${
                                        isSelected ? 'bg-slate-900/90 text-slate-200 border-slate-700/80' : 'bg-slate-950/60 text-slate-300 border-slate-800/80'
                                      }`}>
                                        {hw.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Card Stats Bar (DUE DATE / PRIORITY / TYPE) */}
                                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px] text-slate-400">
                                    <div className="flex items-center space-x-1.5 truncate text-sky-300 font-bold">
                                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                      <span className="truncate">
                                        {hw.dueDate ? `ส่ง ${hw.dueDate}` : 'ไม่มีกำหนด'}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0">
                                      {hw.priority === 'ด่วนที่สุด' && (
                                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-black text-[9px] animate-pulse">
                                          ด่วนที่สุด
                                        </span>
                                      )}
                                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-bold text-[9px]">
                                        {hw.workType === 'กลุ่ม' ? '👥 กลุ่ม' : '👤 เดี่ยว'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Holographic selected RGB flow bottom bar */}
                                {isSelected && (
                                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.rgbBorderGradient} animate-rgb-flow-fast relative z-10`} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* FLOATING / STICKY BOTTOM ACTION BAR */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:px-8 bg-slate-900/95 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md z-30">
                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs font-heading">
                        {selectedHwIds.length}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-white font-heading block">
                          เลือกการ์ดการบ้านไว้ {selectedHwIds.length} ใบ
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:block">
                          {selectedHwIds.length === 0 ? 'แตะที่การ์ดเพื่อเลือกวิชาที่ต้องการแชร์' : 'กดปุ่มด้านขวาเพื่อไปขั้นตอนเลือกเพื่อนที่จะส่งต่อ'}
                        </span>
                      </div>
                    </div>

                    {selectedHwIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedHwIds([])}
                        className="text-xs text-slate-400 hover:text-rose-400 font-bold underline cursor-pointer"
                      >
                        ล้างที่เลือก
                      </button>
                    )}
                  </div>

                  {/* Primary Next Step Button: Go to Friends Selection */}
                  <button
                    disabled={selectedHwIds.length === 0}
                    onClick={() => setShareStep('SELECT_FRIENDS')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black font-heading text-xs sm:text-sm shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{siteSettings?.friendsBtnNextSelectFriends || 'เลือกเสร็จแล้ว → ไปเลือกเพื่อนที่จะแชร์'} ({selectedHwIds.length} ใบ)</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: SELECT RECIPIENT FRIENDS (เลือกเพื่อนที่จะแชร์) */}
            {/* ------------------------------------------------------------- */}
            {shareStep === 'SELECT_FRIENDS' && (
              <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                {/* Step 2 Top Header: Back Button + Step Indicator */}
                <div className="p-4 sm:px-8 bg-slate-900/90 border-b border-slate-800/80 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShareStep('SELECT_CARDS')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold font-heading flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ย้อนกลับไปเลือกการ์ดใหม่</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 font-black font-heading">
                        ขั้นตอนที่ 2/2
                      </span>
                      <h3 className="text-sm sm:text-base font-black font-heading text-white hidden sm:block">
                        เลือกเพื่อนที่จะรับการ์ดการบ้าน
                      </h3>
                    </div>
                  </div>

                  {/* Batch Select Friends */}
                  {friends.length > 0 && (
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllFriends}
                        className="text-xs text-sky-300 hover:text-sky-200 font-bold font-heading flex items-center space-x-1.5 cursor-pointer bg-sky-950/70 hover:bg-sky-900/80 px-3.5 py-1.5 rounded-xl border border-sky-800 transition-all shadow-xs"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>
                          {filteredShareFriends.every(f => selectedFriendUids.includes(f.uid)) && filteredShareFriends.length > 0
                            ? 'ยกเลิกเลือกเพื่อนทั้งหมด'
                            : `เลือกเพื่อนทั้งหมด (${filteredShareFriends.length} คน)`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected Cards Mini-Preview Carousel Ribbon */}
                <div className="px-4 sm:px-8 py-3 bg-slate-900/40 border-b border-slate-800/60 shrink-0 overflow-x-auto no-scrollbar">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading shrink-0 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>การ์ดที่เลือกไว้ ({selectedHomeworkObjects.length} ใบ):</span>
                    </span>
                    {selectedHomeworkObjects.map((hw) => {
                      const theme = getCardTheme(hw.subject, hw.priority);
                      return (
                        <div
                          key={hw.id}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme.badgeBg} bg-slate-900/90 shrink-0 shadow-xs`}
                        >
                          <span className="text-xs">{theme.elementSymbol}</span>
                          <span className="text-xs font-bold text-white font-heading truncate max-w-[140px]">
                            {hw.subject}
                          </span>
                          <button
                            onClick={() => handleToggleHwSelect(hw.id)}
                            className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                            title="นำการ์ดนี้ออก"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 Body: Friends Selection Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
                  {/* Search Friends Field */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหาเพื่อนในรายชื่อตามชื่อ หรือ Username..."
                      value={shareFriendSearch}
                      onChange={(e) => setShareFriendSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-md"
                    />
                  </div>

                  {/* Friends List Grid */}
                  {friends.length === 0 ? (
                    <div className="p-8 bg-slate-900/60 rounded-3xl text-center space-y-3 border border-slate-800">
                      <Users className="w-12 h-12 text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-slate-200 font-heading">
                        คุณยังไม่มีเพื่อนในระบบ
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        กรุณาไปที่แท็บ "เพิ่มเพื่อน" เพื่อค้นหาและเชื่อมต่อกับเพื่อนร่วมห้องก่อนทำการแชร์การบ้าน
                      </p>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-heading cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ เพิ่มเพื่อนใหม่ตอนนี้</span>
                      </button>
                    </div>
                  ) : filteredShareFriends.length === 0 ? (
                    <div className="p-8 bg-slate-900/60 rounded-3xl text-center border border-slate-800">
                      <p className="text-sm font-bold text-slate-300 font-heading">
                        ไม่พบเพื่อนที่ตรงกับการค้นหา "{shareFriendSearch}"
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {filteredShareFriends.map((friend) => {
                        const isChecked = selectedFriendUids.includes(friend.uid);
                        return (
                          <div
                            key={friend.uid}
                            onClick={() => toggleFriendSelect(friend.uid)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none shadow-md ${
                              isChecked
                                ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-500/20 transform -translate-y-0.5'
                                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 font-heading">
                                {friend.displayName.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-sm text-white block truncate font-heading">
                                  {friend.displayName}
                                </span>
                                <span className="text-xs text-slate-400 truncate block">
                                  @{friend.username || friend.email.split('@')[0]}
                                </span>
                              </div>
                            </div>

                            <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs scale-105'
                                : 'border-slate-700 bg-slate-800'
                            }`}>
                              {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Clarification Box */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5 shadow-md">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold font-heading">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>ระบบแชร์การบ้านแยกบัญชีอิสระ:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      เมื่อส่งการ์ดแล้ว การบ้านจะถูกคัดลอกไปยังหน้าหลักของเพื่อนทันที โดยเริ่มความคืบหน้าที่ 0% เพื่อให้เพื่อนสามารถติ๊กเสร็จงานและติดตามงานได้ด้วยตนเอง
                    </p>
                  </div>

                  {/* Share Success Toast */}
                  {shareSuccessMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 flex items-center space-x-3 text-emerald-200 text-sm font-bold shadow-xl animate-fadeIn">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{shareSuccessMessage}</span>
                    </div>
                  )}
                </div>

                {/* Step 2 Bottom Sticky Action Bar */}
                <div className="p-4 sm:px-8 bg-slate-900/95 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md z-30 shrink-0">
                  <div className="text-xs sm:text-sm text-slate-300 font-heading">
                    พร้อมแชร์การบ้าน <strong className="text-amber-400 font-bold">{selectedHwIds.length}</strong> วิชา ให้เพื่อน <strong className="text-sky-400 font-bold">{selectedFriendUids.length}</strong> คน
                  </div>

                  <button
                    disabled={isSharing || selectedHwIds.length === 0 || selectedFriendUids.length === 0}
                    onClick={handleExecuteShare}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black font-heading text-sm shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                        <span>กำลังส่งการ์ดการบ้าน...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span>
                          {selectedHwIds.length > 0 && selectedFriendUids.length > 0
                            ? `${siteSettings?.friendsShareButton || 'ยืนยันแชร์การบ้าน'} ${selectedHwIds.length} ใบ ให้เพื่อน ${selectedFriendUids.length} คน 🎉`
                            : 'เลือกเพื่อนเพื่อแชร์การบ้าน'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FRIENDS LIST */}
        {/* ========================================================================= */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-5 animate-fadeIn">
            {/* Search Friends Field */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาเพื่อนตามชื่อ หรือชื่อผู้ใช้..."
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-md"
              />
            </div>

            {/* Friends Cards */}
            {filteredFriends.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-900/60 rounded-3xl border border-dashed border-slate-800">
                <Users className="w-14 h-14 text-slate-700 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-200 font-heading">
                  {friends.length === 0 ? 'คุณยังไม่มีเพื่อนในระบบ' : 'ไม่พบเพื่อนที่ตรงกับการค้นหา'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {friends.length === 0 
                    ? 'กดที่แท็บ "เพิ่มเพื่อน" เพื่อค้นหาเพื่อนร่วมชั้นและเชื่อมต่อกันได้ทันที'
                    : 'ลองพิมพ์ค้นหาด้วยคำใหม่อีกครั้ง'}
                </p>
                {friends.length === 0 && (
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ เพิ่มเพื่อนคนแรก</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredFriends.map((friend) => (
                  <div 
                    key={friend.uid}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-900 hover:border-sky-500 transition-all shadow-md flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black font-heading text-sm shadow-xs shrink-0">
                        {friend.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate font-heading">
                          {friend.displayName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          @{friend.username || friend.email.split('@')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedFriendUids([friend.uid]);
                          setActiveTab('share');
                          setShareStep('SELECT_CARDS');
                        }}
                        title="แชร์การบ้านให้เพื่อนคนนี้"
                        className="p-2.5 text-amber-400 bg-amber-950/60 hover:bg-amber-900/80 rounded-xl transition-colors cursor-pointer border border-amber-500/30"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบ "${friend.displayName}" ออกจากรายชื่อเพื่อนใช่หรือไม่?`)) {
                            onRemoveFriend(friend.uid);
                          }
                        }}
                        title="ลบเพื่อน"
                        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADD FRIEND / SEARCH */}
        {/* ========================================================================= */}
        {activeTab === 'add' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-5 animate-fadeIn">
            <form onSubmit={handleSearchUsers} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อ, Username หรือ อีเมล ของเพื่อน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-md"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-heading text-sm rounded-2xl shadow-md disabled:opacity-50 flex items-center space-x-2 cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>ค้นหา</span>
              </button>
            </form>

            {/* Search Results */}
            <div className="space-y-3 pt-2">
              {isSearching && (
                <div className="text-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs">กำลังค้นหาบัญชีผู้ใช้ในระบบ...</p>
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && (
                <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800">
                  <p className="text-sm font-bold text-slate-200 font-heading">
                    ไม่พบบัญชีผู้ใช้ที่ตรงกับ "{searchQuery}"
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ลองค้นหาด้วยชื่อผู้ใช้ (Username) หรืออีเมลที่เพื่อนใช้ลงทะเบียน
                  </p>
                </div>
              )}

              {!isSearching && searchResults.map((user) => {
                const alreadyFriend = isFriend(user.uid);
                const isPending = isPendingOutgoing(user.uid);
                const incoming = incomingReqFrom(user.uid);
                const isLoading = actionLoadingId === user.uid;

                return (
                  <div
                    key={user.uid}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shadow-md hover:border-slate-700"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold font-heading text-sm shadow-xs shrink-0">
                        {user.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate font-heading">
                          {user.displayName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          @{user.username || user.email.split('@')[0]}
                        </p>
                      </div>
                    </div>

                    <div>
                      {alreadyFriend ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>เป็นเพื่อนแล้ว</span>
                        </span>
                      ) : incoming ? (
                        <button
                          onClick={() => onAcceptRequest(incoming)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black font-heading shadow-md flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>ตอบรับคำขอ</span>
                        </button>
                      ) : isPending ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 text-xs font-medium flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>ส่งคำขอแล้ว</span>
                        </span>
                      ) : (
                        <button
                          disabled={isLoading}
                          onClick={() => handleAddFriendClick(user)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          <span>เพิ่มเพื่อน</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FRIEND REQUESTS */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading">
                คำขอเป็นเพื่อนที่รอการตอบรับ ({incomingRequests.length})
              </h4>

              {incomingRequests.length === 0 ? (
                <div className="p-8 bg-slate-900/60 rounded-3xl text-center text-xs text-slate-500 border border-slate-800">
                  ไม่มีคำขอเป็นเพื่อนในขณะนี้
                </div>
              ) : (
                <div className="space-y-2.5">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 font-heading">
                          {req.fromDisplayName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-white truncate font-heading">
                            {req.fromDisplayName}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">
                            @{req.fromUsername || 'user'} ส่งคำขอเป็นเพื่อนถึงคุณ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onAcceptRequest(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ยอมรับ</span>
                        </button>
                        <button
                          onClick={() => onRejectRequest(req.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing pending requests */}
            {outgoingRequests.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-heading">
                  คำขอที่คุณส่งไป ({outgoingRequests.length})
                </h4>
                <div className="space-y-2">
                  {outgoingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400"
                    >
                      <span className="truncate">ส่งคำขอถึง @{req.toUsername || req.toUid.slice(0, 6)}</span>
                      <span className="text-amber-400 font-bold">รอการตอบรับ...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
