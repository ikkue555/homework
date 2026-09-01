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
  BookOpen, 
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
  Maximize2
} from 'lucide-react';
import { Friend, FriendRequest, Homework, UserProfile } from '../types';
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
  onSendFriendRequest: (targetUser: UserProfile) => Promise<void>;
  onDirectAddFriend: (targetUser: UserProfile) => Promise<void>;
  onAcceptRequest: (request: FriendRequest) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onRemoveFriend: (friendUid: string) => Promise<void>;
  onShareHomework: (homeworkOrList: Homework | Homework[], targetFriends: Friend[]) => Promise<void>;
}

type TabType = 'friends' | 'share' | 'add' | 'requests';
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
    cardBorder: 'border-rose-500/80 dark:border-rose-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(244,63,94,0.8),0_0_70px_rgba(251,146,60,0.4)]',
    rgbBorderGradient: 'from-rose-600 via-amber-400 via-orange-500 to-red-600',
    glowShadow: 'shadow-[0_0_35px_rgba(244,63,94,0.8),0_0_70px_rgba(251,146,60,0.4)]',
    foilGradient: 'from-rose-600 via-orange-500 to-amber-400',
    bannerBg: 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500/50 text-rose-200',
    orbBg: 'bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-rose-500/50',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    accentColor: '#f43f5e',
    elementSymbol: '🔥',
  },
  electric: {
    name: 'สายฟ้ารหัส (Thunder)',
    element: 'THUNDER',
    icon: Zap,
    cardBorder: 'border-amber-400 dark:border-amber-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(245,158,11,0.8),0_0_70px_rgba(6,182,212,0.4)]',
    rgbBorderGradient: 'from-amber-400 via-yellow-200 via-cyan-400 to-amber-500',
    glowShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.8),0_0_70px_rgba(6,182,212,0.4)]',
    foilGradient: 'from-amber-500 via-yellow-300 to-orange-500',
    bannerBg: 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-400/50 text-amber-200',
    orbBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-400/50',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    textColor: 'text-amber-400',
    accentColor: '#f59e0b',
    elementSymbol: '⚡',
  },
  water: {
    name: 'สมุทรพหุภาษา (Water)',
    element: 'WATER',
    icon: Globe2,
    cardBorder: 'border-cyan-400 dark:border-cyan-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(6,182,212,0.8),0_0_70px_rgba(59,130,246,0.4)]',
    rgbBorderGradient: 'from-cyan-400 via-sky-300 via-blue-500 to-teal-400',
    glowShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.8),0_0_70px_rgba(59,130,246,0.4)]',
    foilGradient: 'from-cyan-500 via-sky-400 to-blue-600',
    bannerBg: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-cyan-400/50 text-cyan-200',
    orbBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-400/50',
    badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    textColor: 'text-cyan-400',
    accentColor: '#06b6d4',
    elementSymbol: '💧',
  },
  nature: {
    name: 'พฤกษาพฤติกรรม (Nature)',
    element: 'NATURE',
    icon: Atom,
    cardBorder: 'border-emerald-400 dark:border-emerald-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(16,185,129,0.8),0_0_70px_rgba(132,204,22,0.4)]',
    rgbBorderGradient: 'from-emerald-400 via-lime-300 via-teal-400 to-green-500',
    glowShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.8),0_0_70px_rgba(132,204,22,0.4)]',
    foilGradient: 'from-emerald-500 via-teal-400 to-lime-500',
    bannerBg: 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-400/50 text-emerald-200',
    orbBg: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-400/50',
    badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    textColor: 'text-emerald-400',
    accentColor: '#10b981',
    elementSymbol: '🌿',
  },
  arcane: {
    name: 'มนตราประวัติศาสตร์ (Arcane)',
    element: 'ARCANE',
    icon: Scroll,
    cardBorder: 'border-purple-400 dark:border-purple-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(168,85,247,0.8),0_0_70px_rgba(217,70,239,0.4)]',
    rgbBorderGradient: 'from-purple-500 via-fuchsia-400 via-indigo-400 to-violet-600',
    glowShadow: 'shadow-[0_0_35px_rgba(168,85,247,0.8),0_0_70px_rgba(217,70,239,0.4)]',
    foilGradient: 'from-purple-500 via-fuchsia-400 to-indigo-600',
    bannerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-purple-400/50 text-purple-200',
    orbBg: 'bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-purple-400/50',
    badgeBg: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
    textColor: 'text-purple-400',
    accentColor: '#a855f7',
    elementSymbol: '🔮',
  },
  celestial: {
    name: 'สุริยันศักดิ์สิทธิ์ (Celestial)',
    element: 'COSMIC',
    icon: Crown,
    cardBorder: 'border-yellow-400 dark:border-yellow-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.45)]',
    selectedGlow: 'shadow-[0_0_35px_rgba(234,179,8,0.8),0_0_70px_rgba(168,85,247,0.4)]',
    rgbBorderGradient: 'from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 via-indigo-500 to-fuchsia-500',
    glowShadow: 'shadow-[0_0_35px_rgba(234,179,8,0.8),0_0_70px_rgba(168,85,247,0.4)]',
    foilGradient: 'from-amber-400 via-yellow-200 to-yellow-500',
    bannerBg: 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-yellow-400/50 text-yellow-200',
    orbBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-slate-950 shadow-yellow-400/50',
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
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
  onSendFriendRequest,
  onDirectAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onShareHomework,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => preselectedHomework ? 'share' : 'friends');

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
    preselectedHomework ? [preselectedHomework.id] : (homeworks.length > 0 ? [homeworks[0].id] : [])
  );
  const [hwSearchFilter, setHwSearchFilter] = useState('');
  const [hwElementFilter, setHwElementFilter] = useState<ElementFilterType>('ALL');
  const [selectedFriendUids, setSelectedFriendUids] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  // Set selected homework when preselectedHomework changes or modal opens
  useEffect(() => {
    if (preselectedHomework) {
      setSelectedHwIds(prev => prev.includes(preselectedHomework.id) ? prev : [preselectedHomework.id, ...prev]);
      setActiveTab('share');
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

  // Filtered Homeworks list for Game Card Deck sharing
  const filteredHomeworks = useMemo(() => {
    return (homeworks || []).filter(hw => {
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
    });
  }, [homeworks, hwElementFilter, hwSearchFilter]);

  // Selected homeworks objects
  const selectedHomeworkObjects = useMemo(() => {
    return homeworks.filter(h => selectedHwIds.includes(h.id));
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
    if (selectedFriendUids.length === friends.length) {
      setSelectedFriendUids([]);
    } else {
      setSelectedFriendUids(friends.map(f => f.uid));
    }
  };

  // Handle Submit Share Homework
  const handleExecuteShare = async () => {
    if (selectedHwIds.length === 0) {
      alert('กรุณาเลือกการบ้านที่ต้องการแชร์อย่างน้อย 1 วิชา');
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
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg backdrop-blur-md">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-lg font-black font-heading text-white tracking-wide truncate">
                ระบบเพื่อน & สำรับการ์ดเกม 3D (TCG Card Deck)
              </h2>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>FULLSCREEN 3D MODE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              ส่งต่อการบ้านให้เพื่อนในรูปแบบการ์ดเกม 3D ธาตุสีวิชา พร้อมบันทึกความคืบหน้าแยกอิสระในบัญชีของเพื่อน
            </p>
          </div>
        </div>

        {/* Global Action & Close */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-700"
            title="ปิดหน้าต่างเต็มจอ"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">ปิด</span>
          </button>
        </div>
      </header>

      {/* FULLSCREEN TABS BAR */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 pt-2 gap-1.5 overflow-x-auto shrink-0">
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
          <span>แชร์การบ้าน (สำรับการ์ด 3D)</span>
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
          <span>เพื่อนของฉัน ({friends.length})</span>
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
          <span>เพิ่มเพื่อน</span>
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
          <span>คำขอเป็นเพื่อน ({incomingRequests.length})</span>
          {incomingRequests.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* FULLSCREEN CONTENT BODY */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
        {/* TAB 1: SHARE HOMEWORK - 100% FULLSCREEN 3D GAME CARD DECK VIEW */}
        {activeTab === 'share' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT MAIN STAGE: 3D CARD DECK SELECTION */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800/80">
              {/* Top Controls: Search + Element Filters + Select All */}
              <div className="space-y-3 pb-4 border-b border-slate-800/80 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                      1
                    </div>
                    <h3 className="text-sm sm:text-base font-black font-heading text-white flex items-center space-x-2">
                      <span>สำรับการ์ดการบ้าน 3D</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        เลือกแล้ว {selectedHwIds.length} จาก {homeworks.length} ใบ
                      </span>
                    </h3>
                  </div>

                  {/* Batch Select Controls */}
                  {homeworks.length > 0 && (
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllHomeworks}
                        className="text-xs text-amber-300 hover:text-amber-200 font-bold font-heading flex items-center space-x-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
                      >
                        {filteredHomeworks.every(h => selectedHwIds.includes(h.id)) ? (
                          <>
                            <Square className="w-3.5 h-3.5 text-amber-400" />
                            <span>ยกเลิกเลือกทั้งหมด</span>
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>เลือกการ์ดทั้งหมด ({filteredHomeworks.length} ใบ)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter and Search Bar for Elemental Cards */}
                {homeworks.length > 0 && (
                  <div className="flex flex-col md:flex-row gap-2.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-md">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ค้นหาตามชื่อการ์ด, วิชา, ธาตุ..."
                        value={hwSearchFilter}
                        onChange={(e) => setHwSearchFilter(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    {/* Elemental Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
                              : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3D CARDS DECK GRID */}
              <div className="flex-1 overflow-y-auto pt-4 pr-1">
                {homeworks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-center">
                    <Swords className="w-16 h-16 text-slate-700 mb-3" />
                    <h4 className="text-base font-bold text-slate-300 font-heading">
                      ยังไม่มีการ์ดการบ้านในสำรับ
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      กรุณากดเพิ่มการบ้านในหน้าหลักเพื่อสร้างการ์ดใบใหม่ในสำรับของคุณ
                    </p>
                  </div>
                ) : filteredHomeworks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-center">
                    <p className="text-sm font-bold text-slate-300">
                      ไม่พบการ์ดตรงตามคำค้นหา "{hwSearchFilter}"
                    </p>
                    <button
                      onClick={() => {
                        setHwSearchFilter('');
                        setHwElementFilter('ALL');
                      }}
                      className="mt-3 px-3.5 py-1.5 bg-slate-800 text-amber-400 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-6">
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

                          {/* Interactive Card Canvas */}
                          <div
                            onClick={() => handleToggleHwSelect(hw.id)}
                            className={`relative rounded-3xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none ${
                              isSelected 
                                ? `p-[2.5px] bg-gradient-to-r ${theme.rgbBorderGradient} animate-rgb-flow-fast transform -translate-y-2 scale-[1.03] ${theme.glowShadow} z-10` 
                                : `border-2 border-slate-800 bg-slate-900/90 hover:border-slate-600 ${theme.cardGlow} hover:-translate-y-1`
                            }`}
                            style={{ minHeight: '340px' }}
                          >
                            <div className={`w-full h-full flex flex-col justify-between rounded-[22px] overflow-hidden relative ${isSelected ? 'bg-slate-950' : 'bg-slate-900/90'}`}>
                              {/* Holographic light sweep sheen across surface */}
                              {isSelected && (
                                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px] z-20">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full h-full animate-holo-sweep" />
                                </div>
                              )}

                              {/* Card Top Banner: Element Icon Only + Animated Selection Crest */}
                              <div className={`p-2 border-b ${theme.bannerBg} flex items-center justify-between text-xs font-black tracking-wider relative z-10`}>
                                <div className="flex items-center space-x-1">
                                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/40 border border-white/10 shadow-xs" title={theme.name}>
                                    <span className="text-sm">{theme.elementSymbol}</span>
                                  </div>
                                </div>

                                {/* Dynamic Check / Selected RGB Crest */}
                                {isSelected ? (
                                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/50 animate-scaleUp">
                                    <Sparkles className="w-3 h-3 text-slate-950 animate-star-spin" />
                                    <span className="text-[10px] font-heading font-black">SELECTED</span>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-lg flex items-center justify-center border border-slate-600 bg-slate-800 group-hover:border-slate-400 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                  </div>
                                )}
                              </div>

                              {/* Card Main Stage: Orb Icon + Subject */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                                <div className="space-y-2.5">
                                  {/* Subject Orb & Element Art */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className={`w-11 h-11 rounded-2xl ${theme.orbBg} flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform ${isSelected ? 'ring-2 ring-white/50 animate-pulse' : ''}`}>
                                      <ElementIcon className="w-5 h-5 text-inherit" />
                                    </div>

                                    {/* Rarity Tier Badge */}
                                    <div className="text-right">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase ${rarity.badgeClass}`}>
                                        {rarity.code}
                                      </span>
                                      <div className="flex items-center justify-end mt-1 space-x-0.5">
                                        {Array.from({ length: rarity.stars }).map((_, i) => (
                                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card Title & Subject Badge */}
                                  <div>
                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${theme.badgeBg} inline-block mb-1 font-heading`}>
                                      {hw.subject}
                                    </span>
                                    <h4 className={`font-black text-sm sm:text-base line-clamp-2 font-heading transition-colors leading-snug ${
                                      isSelected ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white group-hover:text-amber-300'
                                    }`}>
                                      {hw.title || hw.description.slice(0, 40) || 'เควสการบ้าน'}
                                    </h4>
                                  </div>

                                  {/* Description Box */}
                                  {hw.description && (
                                    <p className={`text-[11px] line-clamp-2 leading-relaxed p-2 rounded-xl border transition-colors ${
                                      isSelected ? 'bg-slate-900/90 text-slate-200 border-slate-700/90' : 'bg-slate-950/70 text-slate-300 border-slate-800'
                                    }`}>
                                      {hw.description}
                                    </p>
                                  )}
                                </div>

                                {/* Card Stats Bar (TCG Style: DUE DATE / PRIORITY / TYPE) */}
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
                                      {hw.workType === 'กลุ่ม' ? '👥 งานกลุ่ม' : '👤 งานเดี่ยว'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Holographic selected RGB flow bottom bar */}
                              {isSelected && (
                                <div className={`h-2 w-full bg-gradient-to-r ${theme.rgbBorderGradient} animate-rgb-flow-fast relative z-10`} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR DOCK: SELECT RECIPIENT FRIENDS & EXECUTE SHARE */}
            <div className="w-full lg:w-96 shrink-0 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 shadow-2xl">
              <div className="space-y-4">
                {/* Step 2 Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-heading text-white">
                        เลือกเพื่อนที่จะรับการ์ด
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        เลือกแล้ว {selectedFriendUids.length} จาก {friends.length} คน
                      </p>
                    </div>
                  </div>

                  {friends.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllFriends}
                      className="text-xs text-sky-400 hover:text-sky-300 font-bold font-heading hover:underline cursor-pointer bg-sky-950/60 px-2.5 py-1 rounded-xl border border-sky-800"
                    >
                      {selectedFriendUids.length === friends.length ? 'ยกเลิกทั้งหมด' : 'เลือกเพื่อนทั้งหมด'}
                    </button>
                  )}
                </div>

                {/* Friends List or Empty state */}
                {friends.length === 0 ? (
                  <div className="p-5 bg-slate-950/60 rounded-2xl text-center space-y-2 border border-slate-800">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      คุณยังไม่มีเพื่อนในระบบ กรุณากดเพิ่มเพื่อนก่อนเพื่อแชร์การบ้าน
                    </p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-heading cursor-pointer shadow-xs"
                    >
                      + เพิ่มเพื่อนตอนนี้
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] lg:max-h-[380px] overflow-y-auto pr-1">
                    {friends.map((friend) => {
                      const isChecked = selectedFriendUids.includes(friend.uid);
                      return (
                        <div
                          key={friend.uid}
                          onClick={() => toggleFriendSelect(friend.uid)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                            isChecked
                              ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 shadow-md'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-heading">
                              {friend.displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white block truncate font-heading">
                                {friend.displayName}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                @{friend.username || friend.email.split('@')[0]}
                              </span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : 'border-slate-700 bg-slate-800'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Constraint info */}
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ระบบแชร์การบ้านแบบแยกบัญชี:</span>
                  </div>
                  <p className="leading-relaxed">
                    การบ้านจะเริ่มต้นที่ 0% ในบัญชีของเพื่อน และมีป้าย "แชร์โดย: {currentUser.displayName || currentUser.username}"
                  </p>
                </div>

                {/* Share Success Toast */}
                {shareSuccessMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 flex items-center space-x-2 text-emerald-200 text-xs font-bold animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{shareSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* ACTION EXECUTION BUTTON */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  disabled={isSharing || selectedHwIds.length === 0 || selectedFriendUids.length === 0}
                  onClick={handleExecuteShare}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black font-heading text-sm shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>กำลังส่งการ์ดการบ้าน...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      <span>
                        {selectedHwIds.length > 0 && selectedFriendUids.length > 0
                          ? `ส่งการ์ด ${selectedHwIds.length} ใบ ให้เพื่อน ${selectedFriendUids.length} คน`
                          : 'เลือกการ์ด & เพื่อนเพื่อส่ง'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRIENDS LIST */}
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
                        className="p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
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

        {/* TAB 3: ADD FRIEND / SEARCH */}
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

        {/* TAB 4: FRIEND REQUESTS */}
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
