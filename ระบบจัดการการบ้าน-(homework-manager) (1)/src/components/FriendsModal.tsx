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
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserX,
  Layers,
  CheckSquare,
  Square,
  Tag,
  Flame,
  FileText,
  Swords,
  Maximize2,
  Zap,
  Crown
} from 'lucide-react';
import { Friend, FriendRequest, Homework, UserProfile } from '../types';
import { searchUsers } from '../lib/firebase';
import { HomeworkGameCardPickerModal } from './HomeworkGameCardPickerModal';

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
type HomeworkFilterType = 'all' | 'pending' | 'completed' | 'group' | 'urgent';

// Vibrant color palette themes for subject cards
const SUBJECT_PALETTES = [
  {
    gradient: 'from-blue-500 via-indigo-500 to-sky-500',
    cardBg: 'bg-gradient-to-br from-blue-50/90 via-indigo-50/30 to-white dark:from-blue-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-blue-200/90 dark:border-blue-800/60',
    selectedBorder: 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10',
    badge: 'bg-blue-100/90 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
    checkBg: 'bg-blue-600 text-white border-blue-600',
    element: '💧 สมุทรภาษา',
  },
  {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-emerald-200/90 dark:border-emerald-800/60',
    selectedBorder: 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10',
    badge: 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white',
    checkBg: 'bg-emerald-600 text-white border-emerald-600',
    element: '🌿 พฤกษาวิทย์',
  },
  {
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-amber-200/90 dark:border-amber-800/60',
    selectedBorder: 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 shadow-md shadow-amber-500/10',
    badge: 'bg-amber-100/90 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white',
    checkBg: 'bg-amber-500 text-white border-amber-500',
    element: '⚡ สายฟ้ารหัส',
  },
  {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-purple-50/30 to-white dark:from-violet-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-violet-200/90 dark:border-violet-800/60',
    selectedBorder: 'border-violet-500 dark:border-violet-400 ring-2 ring-violet-500/30 shadow-md shadow-violet-500/10',
    badge: 'bg-violet-100/90 text-violet-900 dark:bg-violet-950 dark:text-violet-200 border-violet-200 dark:border-violet-800',
    iconBg: 'bg-gradient-to-tr from-violet-600 to-purple-600 text-white',
    checkBg: 'bg-violet-600 text-white border-violet-600',
    element: '🔮 มนตราสังคม',
  },
  {
    gradient: 'from-rose-500 via-pink-500 to-red-400',
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/30 to-white dark:from-rose-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    selectedBorder: 'border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10',
    badge: 'bg-rose-100/90 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white',
    checkBg: 'bg-rose-500 text-white border-rose-500',
    element: '🔥 เพลิงคำนวณ',
  },
  {
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    cardBg: 'bg-gradient-to-br from-cyan-50/90 via-sky-50/30 to-white dark:from-cyan-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-cyan-200/90 dark:border-cyan-800/60',
    selectedBorder: 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/10',
    badge: 'bg-cyan-100/90 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
    iconBg: 'bg-gradient-to-tr from-cyan-600 to-sky-600 text-white',
    checkBg: 'bg-cyan-600 text-white border-cyan-600',
    element: '💧 สมุทรภาษา',
  },
  {
    gradient: 'from-fuchsia-500 via-pink-500 to-purple-500',
    cardBg: 'bg-gradient-to-br from-fuchsia-50/90 via-pink-50/30 to-white dark:from-fuchsia-950/40 dark:via-slate-900/90 dark:to-slate-900',
    border: 'border-fuchsia-200/90 dark:border-fuchsia-800/60',
    selectedBorder: 'border-fuchsia-500 dark:border-fuchsia-400 ring-2 ring-fuchsia-500/30 shadow-md shadow-fuchsia-500/10',
    badge: 'bg-fuchsia-100/90 text-fuchsia-900 dark:bg-fuchsia-950 dark:text-fuchsia-200 border-fuchsia-200 dark:border-fuchsia-800',
    iconBg: 'bg-gradient-to-tr from-fuchsia-600 to-pink-600 text-white',
    checkBg: 'bg-fuchsia-600 text-white border-fuchsia-600',
    element: '✨ สุริยันศักดิ์สิทธิ์',
  }
];

function getSubjectPalette(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_PALETTES.length;
  return SUBJECT_PALETTES[index];
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
  const [hwFilterTab, setHwFilterTab] = useState<HomeworkFilterType>('all');
  const [selectedFriendUids, setSelectedFriendUids] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  // Fullscreen Game Card Deck Modal State
  const [isGameDeckPickerOpen, setIsGameDeckPickerOpen] = useState(false);

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

  // Filtered Homeworks list for sharing
  const filteredHomeworks = useMemo(() => {
    return (homeworks || []).filter(hw => {
      if (!hw) return false;

      // Tab filter
      if (hwFilterTab === 'pending' && (hw.completed || hw.progress === 100)) return false;
      if (hwFilterTab === 'completed' && !(hw.completed || hw.progress === 100)) return false;
      if (hwFilterTab === 'group' && hw.workType !== 'กลุ่ม') return false;
      if (hwFilterTab === 'urgent' && hw.priority !== 'ด่วนที่สุด' && hw.priority !== 'สำคัญ') return false;

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
  }, [homeworks, hwFilterTab, hwSearchFilter]);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl border border-sky-100 dark:border-slate-800 shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden transition-colors">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-slate-100">
                    ระบบเพื่อน & แชร์การบ้าน
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-heading">
                    เพื่อน {friends.length} คน
                  </span>
                  {selectedHwIds.length > 0 && activeTab === 'share' && (
                    <span className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-heading">
                      เลือก {selectedHwIds.length} วิชา
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เลือกการบ้านแบบการ์ดรายวิชาสีสันสดใส และเลือกส่งให้เพื่อนหลายคนได้พร้อมกัน
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tabs Navigation */}
          <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 pt-2 gap-1 overflow-x-auto shrink-0">
            <button
              onClick={() => {
                setActiveTab('share');
                setShareSuccessMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'share'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
              <span>แชร์การบ้าน</span>
              {selectedHwIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-extrabold">
                  {selectedHwIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('friends');
                setShareSuccessMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-sky-500" />
              <span>เพื่อนของฉัน ({friends.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('add');
                setShareSuccessMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'add'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-500" />
              <span>เพิ่มเพื่อน</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('requests');
                setShareSuccessMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap relative ${
                activeTab === 'requests'
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>คำขอ ({incomingRequests.length})</span>
              {incomingRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
              )}
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: SHARE HOMEWORK WITH COLORFUL SUBJECT CARDS & MULTI-SELECT */}
            {activeTab === 'share' && (
              <div className="space-y-5 animate-fadeIn">
                {/* HERO PROMO: FULLSCREEN 3D GAME CARD DECK BANNER */}
                <div 
                  onClick={() => setIsGameDeckPickerOpen(true)}
                  className="group relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white border-2 border-amber-400/60 hover:border-amber-300 shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 overflow-hidden transform hover:-translate-y-0.5"
                >
                  {/* Floating Cosmic Glows */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0 transform group-hover:rotate-12 transition-transform">
                        <Swords className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <h4 className="font-black text-sm sm:text-base font-heading text-white flex items-center gap-1.5">
                            <span>เปิดสำรับการ์ดเกมเต็มจอ (Card Deck 3D)</span>
                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" />
                          </h4>
                          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase shadow-xs">
                            GAME MODE
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                          การ์ดลอยขึ้นมาเต็มหน้าจอ แยกตามธาตุสีวิชา (🔥เพลิง, ⚡สายฟ้า, 💧สมุทร, 🌿พฤกษา, 🔮มนตรา) เหมือนเกมการ์ด TCG
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGameDeckPickerOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs font-heading shadow-md flex items-center space-x-2 shrink-0 group-hover:scale-105 transition-all"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>เปิดการ์ดเต็มจอ ({selectedHwIds.length} ใบ)</span>
                    </button>
                  </div>
                </div>

                {/* Important Constraint Notice */}
                <div className="p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-start space-x-3 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-0.5">
                    <p className="leading-relaxed">
                      <strong>เงื่อนไข:</strong> การบ้านที่แชร์จะเริ่ม 0% และบันทึกแยกอิสระในบัญชีของเพื่อน พร้อมป้าย <strong>"แชร์โดย: {currentUser.displayName || currentUser.username}"</strong>
                    </p>
                  </div>
                </div>

                {/* Success Message Banner */}
                {shareSuccessMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-fadeIn shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{shareSuccessMessage}</span>
                  </div>
                )}

                {/* STEP 1: COLORFUL HOMEWORK SELECTION SECTION */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <label className="text-xs sm:text-sm font-bold font-heading text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>เลือกการบ้านที่จะแชร์:</span>
                      </label>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                        เลือกแล้ว {selectedHwIds.length}/{homeworks.length} วิชา
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsGameDeckPickerOpen(true)}
                        className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>เปิดโหมดการ์ดลอย 3D</span>
                      </button>

                      {homeworks.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllHomeworks}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold font-heading hover:underline flex items-center space-x-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/80"
                        >
                          {filteredHomeworks.every(h => selectedHwIds.includes(h.id)) ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-indigo-600" />
                              <span>ยกเลิก</span>
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                              <span>เลือกทั้งหมด</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter and Search Bar for Homework Cards */}
                  {homeworks.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="ค้นหาตามชื่อวิชา, หัวข้อการบ้าน..."
                          value={hwSearchFilter}
                          onChange={(e) => setHwSearchFilter(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {[
                          { id: 'all', label: 'ทั้งหมด' },
                          { id: 'pending', label: 'ยังไม่เสร็จ' },
                          { id: 'completed', label: 'เสร็จแล้ว' },
                          { id: 'group', label: 'งานกลุ่ม' },
                          { id: 'urgent', label: 'งานด่วน' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setHwFilterTab(tab.id as HomeworkFilterType)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                              hwFilterTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COLORFUL SUBJECT CARDS GRID */}
                  {homeworks.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-850 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-heading">
                        คุณยังไม่มีการบ้านในระบบ
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        กรุณากดปุ่ม "+ เพิ่มการบ้าน" ในหน้าหลักก่อนทำการแชร์
                      </p>
                    </div>
                  ) : filteredHomeworks.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        ไม่พบการบ้านที่ตรงกับตัวกรอง "{hwSearchFilter}"
                      </p>
                      <button
                        onClick={() => {
                          setHwSearchFilter('');
                          setHwFilterTab('all');
                        }}
                        className="mt-2 text-xs text-indigo-600 hover:underline font-bold"
                      >
                        ล้างตัวกรอง
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto p-1">
                      {filteredHomeworks.map((hw) => {
                        const isSelected = selectedHwIds.includes(hw.id);
                        const palette = getSubjectPalette(hw.subject);

                        return (
                          <div
                            key={hw.id}
                            onClick={() => handleToggleHwSelect(hw.id)}
                            className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                              isSelected
                                ? `${palette.cardBg} ${palette.selectedBorder}`
                                : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                            }`}
                          >
                            {/* Top row: Subject Badge & Selection Checkbox */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${palette.iconBg}`}>
                                  <BookOpen className="w-3.5 h-3.5" />
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold truncate border font-heading ${palette.badge}`}>
                                  {hw.subject}
                                </span>
                              </div>

                              {/* Checkbox badge */}
                              <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                                isSelected
                                  ? `${palette.checkBg} shadow-xs scale-105`
                                  : 'border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 group-hover:border-indigo-400'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            {/* Middle: Title & Description */}
                            <div className="space-y-1 mb-2.5 min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1 font-heading">
                                {hw.title || hw.description.slice(0, 35) || 'ไม่มีหัวข้อ'}
                              </h4>
                              {hw.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {hw.description}
                                </p>
                              )}
                            </div>

                            {/* Bottom Badges: Due Date, Priority, WorkType */}
                            <div className="pt-2 border-t border-slate-100/80 dark:border-slate-750 flex items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-1 truncate">
                                <Calendar className="w-3 h-3 text-sky-500 shrink-0" />
                                <span className="font-medium truncate">
                                  {hw.dueDate ? `ส่ง ${hw.dueDate}` : 'ไม่มีกำหนดส่ง'}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {hw.priority === 'ด่วนที่สุด' && (
                                  <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-md font-bold">
                                    ด่วนที่สุด
                                  </span>
                                )}
                                {hw.priority === 'สำคัญ' && (
                                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md font-bold">
                                    สำคัญ
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md font-medium">
                                  {hw.workType === 'กลุ่ม' ? 'กลุ่ม' : 'เดี่ยว'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* STEP 2: SELECT FRIENDS RECIPIENTS */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <label className="text-xs sm:text-sm font-bold font-heading text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>เลือกเพื่อนที่จะส่งการบ้านให้ ({selectedFriendUids.length}/{friends.length} คน):</span>
                      </label>
                    </div>

                    {friends.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllFriends}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold font-heading hover:underline cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/80"
                      >
                        {selectedFriendUids.length === friends.length ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกเพื่อนทั้งหมด'}
                      </button>
                    )}
                  </div>

                  {friends.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-center space-y-2 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {friends.map((friend) => {
                        const isChecked = selectedFriendUids.includes(friend.uid);
                        return (
                          <div
                            key={friend.uid}
                            onClick={() => toggleFriendSelect(friend.uid)}
                            className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                              isChecked
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-heading">
                                {friend.displayName.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate font-heading">
                                  {friend.displayName}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                  @{friend.username || friend.email.split('@')[0]}
                                </span>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Share Action Execution Button with Multi-Summary */}
                <div className="pt-2">
                  <button
                    disabled={isSharing || selectedHwIds.length === 0 || selectedFriendUids.length === 0}
                    onClick={handleExecuteShare}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold font-heading text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer transition-all btn-interactive"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังส่งต่อการบ้านให้เพื่อน...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>
                          {selectedHwIds.length > 0 && selectedFriendUids.length > 0
                            ? `แชร์การบ้าน ${selectedHwIds.length} วิชา ให้เพื่อน ${selectedFriendUids.length} คน (รวม ${selectedHwIds.length * selectedFriendUids.length} รายการ)`
                            : 'เลือกการบ้านและเพื่อนเพื่อเริ่มแชร์'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FRIENDS LIST */}
            {activeTab === 'friends' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Search Friends Field */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาเพื่อนตามชื่อ หรือชื่อผู้ใช้..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>

                {/* Friends Cards */}
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-heading">
                      {friends.length === 0 ? 'คุณยังไม่มีเพื่อนในระบบ' : 'ไม่พบเพื่อนที่ตรงกับการค้นหา'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredFriends.map((friend) => (
                      <div 
                        key={friend.uid}
                        className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold font-heading text-sm shadow-xs shrink-0">
                            {friend.displayName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate font-heading">
                              {friend.displayName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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
                            className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบ "${friend.displayName}" ออกจากรายชื่อเพื่อนใช่หรือไม่?`)) {
                                onRemoveFriend(friend.uid);
                              }
                            }}
                            title="ลบเพื่อน"
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              <div className="space-y-4 animate-fadeIn">
                <form onSubmit={handleSearchUsers} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="พิมพ์ชื่อ, Username หรือ อีเมล ของเพื่อน..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-heading text-xs sm:text-sm rounded-2xl shadow-xs disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>ค้นหา</span>
                  </button>
                </form>

                {/* Search Results */}
                <div className="space-y-2 pt-2">
                  {isSearching && (
                    <div className="text-center py-8 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      <p className="text-xs">กำลังค้นหาบัญชีผู้ใช้ในระบบ...</p>
                    </div>
                  )}

                  {!isSearching && hasSearched && searchResults.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-heading">
                        ไม่พบบัญชีผู้ใช้ที่ตรงกับ "{searchQuery}"
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold font-heading text-sm shadow-xs shrink-0">
                            {user.displayName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate font-heading">
                              {user.displayName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              @{user.username || user.email.split('@')[0]}
                            </p>
                          </div>
                        </div>

                        <div>
                          {alreadyFriend ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>เป็นเพื่อนแล้ว</span>
                            </span>
                          ) : incoming ? (
                            <button
                              onClick={() => onAcceptRequest(incoming)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-heading shadow-xs flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ตอบรับคำขอ</span>
                            </button>
                          ) : isPending ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>ส่งคำขอแล้ว</span>
                            </span>
                          ) : (
                            <button
                              disabled={isLoading}
                              onClick={() => handleAddFriendClick(user)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-heading shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UserPlus className="w-3.5 h-3.5" />
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
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                    คำขอเป็นเพื่อนที่รอการตอบรับ ({incomingRequests.length})
                  </h4>

                  {incomingRequests.length === 0 ? (
                    <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
                      ไม่มีคำขอเป็นเพื่อนในขณะนี้
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incomingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-heading">
                              {req.fromDisplayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate font-heading">
                                {req.fromDisplayName}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                @{req.fromUsername || 'user'} ส่งคำขอเป็นเพื่อนถึงคุณ
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              onClick={() => onAcceptRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-heading shadow-xs flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ยอมรับ</span>
                            </button>
                            <button
                              onClick={() => onRejectRequest(req.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
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
                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                      คำขอที่คุณส่งไป ({outgoingRequests.length})
                    </h4>
                    <div className="space-y-1.5">
                      {outgoingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400"
                        >
                          <span className="truncate">ส่งคำขอถึง @{req.toUsername || req.toUid.slice(0, 6)}</span>
                          <span className="text-[11px] text-amber-500 font-medium">รอการตอบรับ...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN GAME CARD DECK PICKER MODAL */}
      <HomeworkGameCardPickerModal
        isOpen={isGameDeckPickerOpen}
        onClose={() => setIsGameDeckPickerOpen(false)}
        homeworks={homeworks}
        selectedIds={selectedHwIds}
        onConfirmSelection={(newSelectedIds) => {
          setSelectedHwIds(newSelectedIds);
        }}
      />
    </>
  );
};
