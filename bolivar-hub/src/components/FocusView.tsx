import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Car, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  BookOpen, 
  ListTodo, 
  Sparkles, 
  Flame, 
  Clock, 
  Award,
  ChevronDown,
  X,
  Video,
  VideoOff
} from 'lucide-react';
import { 
  FocusModeType, 
  ThaiProvinceData, 
  FocusSessionLog, 
  TodoItem, 
  Homework, 
  ExamSchedule 
} from '../types';
import { 
  THAI_PROVINCES, 
  POPULAR_ROAD_PRESETS, 
  MOTIVATIONAL_FOCUS_QUOTES,
  calculateGeoDistanceKm 
} from '../data/focusData';
import { focusAudio } from '../lib/focusAudio';
import { FocusThailandRoadMap } from './FocusThailandRoadMap';

interface FocusViewProps {
  todos: TodoItem[];
  homeworks: Homework[];
  exams: ExamSchedule[];
  onToggleCompleteTodo?: (item: TodoItem, completed: boolean) => void;
  onToggleCompleteHomework?: (item: Homework) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  todos,
  homeworks,
  exams,
  onToggleCompleteTodo,
  onToggleCompleteHomework
}) => {
  // Mode selection: 'car' | 'standard'
  const [selectedMode, setSelectedMode] = useState<FocusModeType>('car');

  // Task selection & Creation
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [selectedLinkedTask, setSelectedLinkedTask] = useState<{
    id: string;
    type: 'todo' | 'homework' | 'exam' | 'custom';
    title: string;
  } | null>(null);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);

  // Car Mode State
  const [originProvince, setOriginProvince] = useState<ThaiProvinceData>(THAI_PROVINCES[0]); // กรุงเทพฯ
  const [destProvince, setDestProvince] = useState<ThaiProvinceData>(THAI_PROVINCES[9]); // เชียงใหม่
  const [roadDurationMode, setRoadDurationMode] = useState<'real' | 'custom'>('custom');
  const [customRoadMinutes, setCustomRoadMinutes] = useState<number>(25);

  // Standard Timer State
  const [standardMinutes, setStandardMinutes] = useState<number>(25);

  // Camera Follow Motion Tracking (เปิด/ปิด อนิเมชันติดตามการเคลื่อนที่)
  const [cameraFollow, setCameraFollow] = useState<boolean>(true);

  // Timer Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);
  const [lastFinishedSession, setLastFinishedSession] = useState<FocusSessionLog | null>(null);

  // Audio & Fullscreen
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const focusContainerRef = useRef<HTMLDivElement>(null);

  // Focus Session History in localStorage
  const [historyLogs, setHistoryLogs] = useState<FocusSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('focus_mode_history_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate Real Road Drive Minutes
  const realRoadMinutes = useMemo(() => {
    const directKm = calculateGeoDistanceKm(originProvince.lat, originProvince.lng, destProvince.lat, destProvince.lng);
    const roadKm = directKm * 1.25;
    return Math.max(20, Math.round((roadKm / 80) * 60));
  }, [originProvince, destProvince]);

  // Determine current session duration
  const targetDurationSeconds = useMemo(() => {
    if (selectedMode === 'car') {
      const mins = roadDurationMode === 'real' ? realRoadMinutes : customRoadMinutes;
      return mins * 60;
    } else {
      return standardMinutes * 60;
    }
  }, [
    selectedMode, 
    roadDurationMode, 
    realRoadMinutes, 
    customRoadMinutes, 
    standardMinutes
  ]);

  // Sync initial timer when user changes target duration while stopped
  useEffect(() => {
    if (!isRunning) {
      setTotalSeconds(targetDurationSeconds);
      setSecondsRemaining(targetDurationSeconds);
    }
  }, [targetDurationSeconds, isRunning]);

  // Countdown Interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining]);

  // Audio Ambience Sync
  useEffect(() => {
    if (isRunning && !isMuted) {
      if (selectedMode === 'car') {
        focusAudio.playHighwayHum();
      } else {
        focusAudio.playZenRain();
      }
    } else {
      focusAudio.stopAmbient();
    }
    return () => {
      focusAudio.stopAmbient();
    };
  }, [isRunning, isMuted, selectedMode]);

  // Rotate motivational quotes every 45 seconds during focus
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_FOCUS_QUOTES.length);
      }, 45000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Keyboard shortcut for Fullscreen (Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Session Completion Handler
  const handleSessionComplete = () => {
    setIsRunning(false);
    focusAudio.stopAmbient();
    focusAudio.playArrivalChime();

    const durationMins = Math.round(totalSeconds / 60);
    const sessionLog: FocusSessionLog = {
      id: Date.now().toString(),
      mode: selectedMode,
      taskTitle: taskTitle.trim() || 'ภารกิจสร้างสมาธิ (Focus Session)',
      durationMinutes: durationMins,
      completedAt: new Date().toISOString(),
      origin: selectedMode === 'car' ? originProvince.name : undefined,
      destination: selectedMode === 'car' ? destProvince.name : undefined,
      flightOrRouteNumber: selectedMode === 'car' ? `${originProvince.name}➔${destProvince.name}` : undefined,
      linkedTaskId: selectedLinkedTask?.id,
      linkedTaskType: selectedLinkedTask?.type
    };

    setLastFinishedSession(sessionLog);
    setIsCompletedModalOpen(true);

    const updated = [sessionLog, ...historyLogs].slice(0, 50);
    setHistoryLogs(updated);
    try {
      localStorage.setItem('focus_mode_history_logs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Timer Control actions
  const handleStartTimer = () => {
    if (!taskTitle.trim() && !selectedLinkedTask) {
      setTaskTitle('อ่านหนังสือ / ทบทวนบทเรียน');
    }
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
    focusAudio.stopAmbient();
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    focusAudio.setMuted(nextMute);
  };

  const handleToggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (next) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  // Progress Percentage
  const progressPercent = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    const elapsed = totalSeconds - secondsRemaining;
    return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
  }, [totalSeconds, secondsRemaining]);

  // Format Time display (HH:MM:SS)
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Total Focus Minutes Today
  const todayMinutes = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return historyLogs
      .filter((log) => log.completedAt.startsWith(todayStr))
      .reduce((acc, log) => acc + log.durationMinutes, 0);
  }, [historyLogs]);

  // Mark linked task as done
  const handleMarkLinkedTaskDone = () => {
    if (selectedLinkedTask) {
      if (selectedLinkedTask.type === 'todo' && onToggleCompleteTodo) {
        const item = todos.find((t) => t.id === selectedLinkedTask.id);
        if (item) onToggleCompleteTodo(item, true);
      } else if (selectedLinkedTask.type === 'homework' && onToggleCompleteHomework) {
        const item = homeworks.find((h) => h.id === selectedLinkedTask.id);
        if (item) onToggleCompleteHomework(item);
      }
    }
    setIsCompletedModalOpen(false);
  };

  const currentTaskLabel = taskTitle.trim() || 'อ่านหนังสือและสร้างสมาธิ';

  return (
    <div ref={focusContainerRef} className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. DEDICATED IMMERSIVE FULLSCREEN MODE (โหมดเต็มหน้าจอ) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 overflow-y-auto no-scrollbar select-none animate-fadeIn">
          {/* Top Bar with Exit Button */}
          <div className="flex items-center justify-between z-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                  โหมดเต็มหน้าจอ • IMMERSIVE FULLSCREEN
                </p>
                <p className="text-xs text-slate-400">
                  กดปุ่ม Esc หรือปุ่มมุมขวาเพื่อออกจากโหมดเต็มจอ
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleFullscreen}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer font-bold text-xs shadow-lg"
              title="ออกจากโหมดเต็มหน้าจอ (Esc)"
            >
              <Minimize2 className="w-4 h-4 text-rose-400" />
              <span>ออกจากเต็มจอ (Esc)</span>
            </button>
          </div>

          {/* Center Prominent Display: กำลังทำ ..... (เป้าหมาย) เหลือเวลา .... */}
          <div className="text-center space-y-4 my-auto z-20 pointer-events-none px-4">
            {/* กำลังทำ ... (เป้าหมาย) */}
            <div className="inline-block max-w-3xl px-6 py-3 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                กำลังทำ
              </span>
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight">
                {currentTaskLabel}
              </h1>
            </div>

            {/* เหลือเวลา ... */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-slate-400 font-bold">
                เหลือเวลา
              </p>
              <div className="text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]">
                {formatTime(secondsRemaining)}
              </div>
            </div>

            {/* Quote */}
            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto italic drop-shadow-md">
              "{MOTIVATIONAL_FOCUS_QUOTES[quoteIndex].th}"
            </p>
          </div>

          {/* Fullscreen Visualizer Stage */}
          <div className="w-full max-w-4xl mx-auto my-2 z-10 pointer-events-auto">
            {selectedMode === 'car' && (
              <FocusThailandRoadMap
                originProvince={originProvince}
                destProvince={destProvince}
                progressPercent={progressPercent}
                isDriving={isRunning}
                cameraFollow={cameraFollow}
                onToggleCameraFollow={() => setCameraFollow(!cameraFollow)}
              />
            )}
            {selectedMode === 'standard' && (
              <div className="relative w-full h-[260px] sm:h-[340px] rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800 flex items-center justify-center p-6 text-white">
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      className="stroke-purple-500 transition-all duration-300"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * progressPercent) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute font-mono text-2xl sm:text-3xl font-black text-purple-300">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Fullscreen HUD Controls */}
          <div className="flex items-center justify-center gap-3 z-20 pb-2">
            <button
              onClick={handleToggleMute}
              className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 transition-all cursor-pointer shadow-lg"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 animate-pulse text-sky-400" />}
            </button>

            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-base shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>เริ่มออกเดินทาง</span>
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-white font-black text-base shadow-xl shadow-amber-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>พักชั่วคราว</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              disabled={secondsRemaining === totalSeconds}
              className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all disabled:opacity-40 cursor-pointer shadow-lg"
              title="รีเซ็ตเวลา"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. REGULAR VIEW (หน้าจอโหมดโฟกัสปกติ) */}
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
              <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight flex items-center gap-2">
                <span>โหมดโฟกัส (Focus Mode)</span>
                <span className="hidden">
                  Deep Work
                </span>
              </h2>
              <p className="hidden">
                ลูกโลกและแผนที่ประเทศไทยของจริง • โมเดลเครื่องบินและรถยนต์สมจริง • โหมดเต็มหน้าจอไร้สิ่งรบกวน
              </p>
            </div>
          </div>
        </div>

        {/* Buttons on Header: Open Fullscreen & Stats */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-sky-50 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
            title="เปิดโหมดเต็มหน้าจอ"
          >
            <Maximize2 className="w-4 h-4 text-sky-600" />
            <span>โหมดเต็มหน้าจอ</span>
          </button>

          <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shrink-0">
            <Clock className="w-4 h-4 text-amber-300" />
            <div className="text-right">
              <p className="text-[9px] text-sky-200 font-mono uppercase">วันนี้</p>
              <p className="text-sm sm:text-base font-black font-mono leading-none">
                {todayMinutes} <span className="text-[10px] font-normal">นาที</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Picker Card: สิ่งที่ต้องทำในการโฟกัสครั้งนี้ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>เป้าหมายที่ต้องโฟกัส (Focus Task)</span>
          </label>

          <button
            onClick={() => setIsTaskSelectorOpen(!isTaskSelectorOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>เลือกจาก To Do หรือการบ้าน</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTaskSelectorOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => {
              setTaskTitle(e.target.value);
              setSelectedLinkedTask(null);
            }}
            placeholder="พิมพ์สิ่งที่ต้องการทำ เช่น อ่านหนังสือฟิสิกส์ ม.4, ตะลุยโจทย์เลข, เขียนเรียงความ..."
            disabled={isRunning}
            className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition-all disabled:opacity-70"
          />

          {selectedLinkedTask && (
            <button
              onClick={() => {
                setSelectedLinkedTask(null);
                setTaskTitle('');
              }}
              disabled={isRunning}
              className="p-3 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-colors"
              title="ยกเลิกการผูกงาน"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Task Selection Dropdown Drawer */}
        {isTaskSelectorOpen && !isRunning && (
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              คลิกเพื่อเลือกงานที่ต้องการเชื่อมโยงเข้ากับการโฟกัส:
            </p>

            {/* From To Do */}
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ListTodo className="w-3 h-3" /> สิ่งที่ต้องทำ (To Do List)
              </p>
              {todos.filter((t) => !t.completed).length === 0 ? (
                <p className="text-xs text-slate-400 italic">ไม่มีงาน To Do ที่ค้างอยู่</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
                  {todos.filter((t) => !t.completed).map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => {
                        setSelectedLinkedTask({ id: todo.id, type: 'todo', title: todo.title });
                        setTaskTitle(todo.title);
                        setIsTaskSelectorOpen(false);
                      }}
                      className="text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-xs font-medium truncate flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{todo.title}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold ml-2 shrink-0">เลือก</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* From Homework */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> การบ้านที่ยังไม่เสร็จ (Homework)
              </p>
              {homeworks.filter((h) => !h.completed).length === 0 ? (
                <p className="text-xs text-slate-400 italic">ไม่มีการบ้านค้าง</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
                  {homeworks.filter((h) => !h.completed).slice(0, 8).map((hw) => (
                    <button
                      key={hw.id}
                      onClick={() => {
                        setSelectedLinkedTask({ id: hw.id, type: 'homework', title: `${hw.subject}: ${hw.title || 'การบ้าน'}` });
                        setTaskTitle(`${hw.subject}: ${hw.title || 'การบ้าน'}`);
                        setIsTaskSelectorOpen(false);
                      }}
                      className="text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 text-xs font-medium truncate flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{hw.subject} - {hw.title || 'การบ้าน'}</span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold ml-2 shrink-0">เลือก</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector Tabs (2 Modes: Car & Standard) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Mode 1: รถยนต์ */}
        <button
          onClick={() => {
            if (!isRunning) setSelectedMode('car');
          }}
          disabled={isRunning}
          className={`relative p-3.5 sm:p-4 rounded-3xl border text-left cursor-pointer transition-all duration-300 ${
            selectedMode === 'car'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/25 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 mb-1.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              selectedMode === 'car' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
            }`}>
              <Car className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black font-heading">1. ขับรถยนต์ (Road Trip)</span>
          </div>
          <p className={`text-[10px] sm:text-xs leading-tight line-clamp-2 ${
            selectedMode === 'car' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
          }`}>
            แผนที่ประเทศไทยของจริง ขับรถเที่ยวทั่วไทยตามเส้นทางจริง
          </p>
        </button>

        {/* Mode 2: จับเวลาปกติ */}
        <button
          onClick={() => {
            if (!isRunning) setSelectedMode('standard');
          }}
          disabled={isRunning}
          className={`relative p-3.5 sm:p-4 rounded-3xl border text-left cursor-pointer transition-all duration-300 ${
            selectedMode === 'standard'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 mb-1.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              selectedMode === 'standard' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-950 text-purple-600'
            }`}>
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black font-heading">2. นับถอยหลังปกติ</span>
          </div>
          <p className={`text-[10px] sm:text-xs leading-tight line-clamp-2 ${
            selectedMode === 'standard' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
          }`}>
            สูตร Pomodoro 25 นาที หรือตั้งเวลานาทีที่ต้องการ
          </p>
        </button>
      </div>

      {/* Mode Configurations (Before starting) */}
      {!isRunning && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 animate-fadeIn">


          {/* Mode 2 Config: Thailand Road Trip */}
          {selectedMode === 'car' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> เลือกจังหวัดในประเทศไทย
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {originProvince.name} ➔ {destProvince.name}
                </span>
              </div>

              {/* Popular Scenic Road Trip Presets */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-xs text-slate-400 shrink-0 font-medium">เส้นทางแนะนำ:</span>
                {POPULAR_ROAD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      const orig = THAI_PROVINCES.find((p) => p.id === preset.originId);
                      const dest = THAI_PROVINCES.find((p) => p.id === preset.destId);
                      if (orig) setOriginProvince(orig);
                      if (dest) setDestProvince(dest);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      originProvince.id === preset.originId && destProvince.id === preset.destId
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {preset.name.split(':')[1] || preset.name}
                  </button>
                ))}
              </div>

              {/* Province Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    จังหวัดจุดเริ่มต้น (Origin):
                  </label>
                  <select
                    value={originProvince.id}
                    onChange={(e) => {
                      const found = THAI_PROVINCES.find((p) => p.id === e.target.value);
                      if (found) setOriginProvince(found);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {THAI_PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    จังหวัดปลายทาง (Destination):
                  </label>
                  <select
                    value={destProvince.id}
                    onChange={(e) => {
                      const found = THAI_PROVINCES.find((p) => p.id === e.target.value);
                      if (found) setDestProvince(found);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {THAI_PROVINCES.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.id === originProvince.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration Choice */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    รูปแบบเวลาขับรถ:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRoadDurationMode('custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      roadDurationMode === 'custom'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    กำหนดเวลาเอง ({customRoadMinutes} นาที)
                  </button>

                  <button
                    onClick={() => setRoadDurationMode('real')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      roadDurationMode === 'real'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ตามเวลาขับรถจริง ({Math.round(realRoadMinutes / 60)} ชม. {realRoadMinutes % 60} นาที)
                  </button>
                </div>
              </div>

              {roadDurationMode === 'custom' && (
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-850 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      พิมพ์ระบุเวลาที่ต้องการ (นาที):
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={customRoadMinutes || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCustomRoadMinutes(isNaN(val) ? 0 : Math.max(1, Math.min(1440, val)));
                        }}
                        placeholder="25"
                        className="w-24 bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-1.5 text-center text-sm font-black font-mono text-emerald-600 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-xs"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">นาที</span>
                    </div>
                  </div>


                </div>
              )}
            </div>
          )}

          {/* Mode 3 Config */}
          {selectedMode === 'standard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Timer className="w-4 h-4" /> เลือกหรือพิมพ์ช่วงเวลาจับเวลาที่ต้องการ
                </span>
              </div>

              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/80 dark:border-purple-850 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    พิมพ์กรอกเวลาที่ต้องการจับ (นาที):
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={standardMinutes || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setStandardMinutes(isNaN(val) ? 0 : Math.max(1, Math.min(1440, val)));
                      }}
                      placeholder="25"
                      className="w-24 bg-white dark:bg-slate-800 border-2 border-purple-400 dark:border-purple-600 rounded-xl px-3 py-1.5 text-center text-sm font-black font-mono text-purple-600 dark:text-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden shadow-xs"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">นาที</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-purple-200/60 dark:border-purple-900/40">
                  <span className="text-[11px] text-slate-400 font-medium">สูตรจับเวลายอดนิยม:</span>
                  {[
                    { mins: 15, label: '15m Sprint' },
                    { mins: 25, label: '25m Pomodoro' },
                    { mins: 45, label: '45m Deep Work' },
                    { mins: 60, label: '60m (1 ชม.)' },
                    { mins: 90, label: '90m Ultradian' }
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setStandardMinutes(item.mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        standardMinutes === item.mins
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Focus Stage: 3D Visualizer or Standard Focus Ring */}
      <div className="space-y-4">


        {selectedMode === 'car' && (
          <FocusThailandRoadMap
            originProvince={originProvince}
            destProvince={destProvince}
            progressPercent={progressPercent}
            isDriving={isRunning}
            cameraFollow={cameraFollow}
            onToggleCameraFollow={() => setCameraFollow(!cameraFollow)}
          />
        )}

        {selectedMode === 'standard' && (
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6 text-white">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="42%" className="stroke-slate-800" strokeWidth="8" fill="none" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-purple-500 transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-md">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-xs font-bold text-purple-300 font-mono mt-1">
                  {progressPercent.toFixed(0)}% เสร็จสิ้น
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Master Digital Timer HUD & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        
        {/* Prominent Digital Countdown Clock Display: กำลังทำ ..... เหลือเวลา .... */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>กำลังทำ: {currentTaskLabel}</span>
          </div>

          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            เหลือเวลา
          </div>
          <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-800 dark:text-white drop-shadow-xs">
            {formatTime(secondsRemaining)}
          </div>
        </div>

        {/* Action Buttons: Play / Pause / Reset / Sound / Fullscreen */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                : 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800 shadow-2xs'
            }`}
            title={isMuted ? 'เปิดเสียงจำลอง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
          </button>

          {/* Camera Follow Animation Toggle (Car Mode) */}
          {selectedMode === 'car' && (
            <button
              onClick={() => setCameraFollow(!cameraFollow)}
              className={`flex items-center space-x-1.5 px-3.5 py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                cameraFollow
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={cameraFollow ? 'ปิดมุมกล้องติดตาม' : 'เปิดมุมกล้องติดตามการเคลื่อนที่'}
            >
              {cameraFollow ? (
                <Video className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {cameraFollow ? 'ติดตามการเคลื่อนที่: เปิด' : 'ติดตาม: ปิด'}
              </span>
            </button>
          )}

          {/* Dedicated Fullscreen Toggle Button */}
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            title="เปิดโหมดเต็มหน้าจอเพื่อสมาธิสูงสุด"
          >
            <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">โหมดเต็มหน้าจอ</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetTimer}
            disabled={secondsRemaining === totalSeconds}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-40 cursor-pointer"
            title="รีเซ็ตเวลา"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Large Start/Pause Button */}
          {!isRunning ? (
            <button
              onClick={handleStartTimer}
              className="flex items-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>เริ่มออกเดินทาง</span>
            </button>
          ) : (
            <button
              onClick={handlePauseTimer}
              className="flex items-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm sm:text-base shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>พักชั่วคราว</span>
            </button>
          )}
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
        <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 font-heading">
          "{MOTIVATIONAL_FOCUS_QUOTES[quoteIndex].th}"
        </p>
        <p className="text-[11px] text-slate-400 italic">
          {MOTIVATIONAL_FOCUS_QUOTES[quoteIndex].en}
        </p>
      </div>

      {/* Completed Focus Session Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5 animate-pop">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg border border-emerald-200 dark:border-emerald-800">
              <Award className="w-9 h-9 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-800 dark:text-slate-100">
                🎉 ยินดีด้วย! คุณถึงที่หมายแล้ว
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                การโฟกัสเสร็จสิ้นอย่างสมบูรณ์แบบ เพิ่มพูนสมาธิและความรู้สำเร็จ
              </p>
            </div>

            {/* Session Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ภารกิจ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {lastFinishedSession?.taskTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เวลาที่โฟกัส:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {lastFinishedSession?.durationMinutes} นาที
                </span>
              </div>
              {lastFinishedSession?.origin && lastFinishedSession?.destination && (
                <div className="flex justify-between">
                  <span className="text-slate-500">เส้นทาง:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {lastFinishedSession.origin} ➔ {lastFinishedSession.destination}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {selectedLinkedTask && (
                <button
                  onClick={handleMarkLinkedTaskDone}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-heading"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ทำเครื่องหมายว่าเสร็จแล้ว ในสิ่งที่ต้องทำ/การบ้าน</span>
                </button>
              )}

              <button
                onClick={() => setIsCompletedModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
