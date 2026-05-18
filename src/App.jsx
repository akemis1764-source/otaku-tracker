import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const CATEGORIES = [
  { id: "anime", label: "アニメ", icon: "📺", unit: "話", color: "#FF6B6B", bgGrad: "linear-gradient(135deg, #FF6B6B, #FF8E8E)" },
  { id: "manga", label: "漫画", icon: "📖", unit: "巻", color: "#4ECDC4", bgGrad: "linear-gradient(135deg, #4ECDC4, #6EE7DE)" },
  { id: "game", label: "ゲーム", icon: "🎮", unit: "時間", color: "#A78BFA", bgGrad: "linear-gradient(135deg, #A78BFA, #C4B5FD)" },
  { id: "lightnovel", label: "ラノベ/小説", icon: "📚", unit: "冊", color: "#F59E0B", bgGrad: "linear-gradient(135deg, #F59E0B, #FBBF24)" },
  { id: "eroge", label: "エロゲ/ノベルゲー", icon: "💻", unit: "時間", color: "#EC4899", bgGrad: "linear-gradient(135deg, #EC4899, #F472B6)" },
];

const ACHIEVEMENTS = [
  { id: "first_log", label: "はじめの一歩", desc: "初めて記録した", icon: "🌟", check: (s) => Object.values(s.totals).some(v => v > 0) },
  { id: "manga_10", label: "漫画好き", desc: "漫画10巻読了", icon: "📖", check: (s) => (s.totals.manga || 0) >= 10 },
  { id: "manga_50", label: "漫画マスター", desc: "漫画50巻読了", icon: "📗", check: (s) => (s.totals.manga || 0) >= 50 },
  { id: "manga_100", label: "漫画キング", desc: "漫画100巻読了", icon: "👑", check: (s) => (s.totals.manga || 0) >= 100 },
  { id: "manga_500", label: "漫画皇帝", desc: "漫画500巻読了", icon: "🏯", check: (s) => (s.totals.manga || 0) >= 500 },
  { id: "anime_10", label: "アニメ入門", desc: "アニメ10話視聴", icon: "📺", check: (s) => (s.totals.anime || 0) >= 10 },
  { id: "anime_50", label: "アニメ廃人", desc: "アニメ50話視聴", icon: "🎬", check: (s) => (s.totals.anime || 0) >= 50 },
  { id: "anime_100", label: "アニメ神", desc: "アニメ100話視聴", icon: "⚡", check: (s) => (s.totals.anime || 0) >= 100 },
  { id: "game_10", label: "ゲーマー", desc: "ゲーム10時間", icon: "🎮", check: (s) => (s.totals.game || 0) >= 10 },
  { id: "game_50", label: "廃ゲーマー", desc: "ゲーム50時間", icon: "🏆", check: (s) => (s.totals.game || 0) >= 50 },
  { id: "game_100", label: "ゲーム仙人", desc: "ゲーム100時間", icon: "🕹️", check: (s) => (s.totals.game || 0) >= 100 },
  { id: "ln_10", label: "文字読み", desc: "ラノベ10冊読了", icon: "📚", check: (s) => (s.totals.lightnovel || 0) >= 10 },
  { id: "eroge_10", label: "ノベルゲーマー", desc: "エロゲ10時間", icon: "💻", check: (s) => (s.totals.eroge || 0) >= 10 },
  { id: "streak_3", label: "3日坊主突破", desc: "3日連続記録", icon: "🔥", check: (s) => s.streak >= 3 },
  { id: "streak_7", label: "一週間の壁", desc: "7日連続記録", icon: "💪", check: (s) => s.streak >= 7 },
  { id: "streak_14", label: "習慣化成功", desc: "14日連続記録", icon: "🧠", check: (s) => s.streak >= 14 },
  { id: "streak_30", label: "鉄の意志", desc: "30日連続記録", icon: "🏅", check: (s) => s.streak >= 30 },
  { id: "all_cat", label: "マルチオタク", desc: "全カテゴリ記録", icon: "🌈", check: (s) => CATEGORIES.every(c => (s.totals[c.id] || 0) > 0) },
  { id: "combo_3", label: "コンボマスター", desc: "1日3カテゴリ記録", icon: "💥", check: (s) => s.maxCombo >= 3 },
  { id: "combo_5", label: "全制覇", desc: "1日5カテゴリ記録", icon: "🎯", check: (s) => s.maxCombo >= 5 },
  { id: "total_100", label: "百の足跡", desc: "累計100記録", icon: "💯", check: (s) => Object.values(s.totals).reduce((a,b)=>a+b,0) >= 100 },
  { id: "total_500", label: "五百の軌跡", desc: "累計500記録", icon: "🗻", check: (s) => Object.values(s.totals).reduce((a,b)=>a+b,0) >= 500 },
  { id: "total_1000", label: "千の境地", desc: "累計1000記録", icon: "✨", check: (s) => Object.values(s.totals).reduce((a,b)=>a+b,0) >= 1000 },
];

const LEVELS = [
  { threshold: 0, title: "ニート見習い", icon: "🐣" },
  { threshold: 10, title: "コンテンツ初心者", icon: "🐥" },
  { threshold: 30, title: "オタク入門", icon: "🦊" },
  { threshold: 75, title: "消費者", icon: "🐺" },
  { threshold: 150, title: "コンテンツ戦士", icon: "⚔️" },
  { threshold: 300, title: "廃人", icon: "👻" },
  { threshold: 500, title: "伝説のオタク", icon: "🐉" },
  { threshold: 1000, title: "神", icon: "✨" },
  { threshold: 2000, title: "超越者", icon: "🌌" },
];

const CHALLENGES = [
  "アニメを1話見よう", "漫画を1巻読もう", "ゲームを30分やろう",
  "ラノベを1章読もう", "積んでた作品に手を出そう", "新ジャンルに挑戦しよう",
  "ノベルゲーを少し進めよう", "昨日と違うカテゴリに触れよう",
  "2つ以上のカテゴリを消化しよう", "1時間集中してコンテンツに浸ろう",
  "短編漫画を1冊完走しよう", "アニメを3話一気見しよう",
];

const COMBO_LABELS = ["", "", "ダブルコンボ!", "トリプルコンボ!", "クアッドコンボ!", "パーフェクト!!"];

const TODAY = () => new Date().toISOString().split("T")[0];
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const STORAGE_KEY = "otaku-tracker-logs";

function loadLogs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.log("No saved data"); }
  return [];
}

function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) { console.error("Save failed:", e); }
}

function getStreak(logs) {
  const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
  if (!dates.length) return 0;
  const today = TODAY();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yStr = y.toISOString().split("T")[0];
  if (dates[0] !== today && dates[0] !== yStr) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    if ((prev - curr) / 864e5 === 1) streak++; else break;
  }
  return streak;
}

function getTotals(logs) {
  const t = {};
  logs.forEach(l => { t[l.category] = (t[l.category] || 0) + l.amount; });
  return t;
}

function getLevel(totals) {
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  let level = LEVELS[0];
  for (const l of LEVELS) { if (total >= l.threshold) level = l; }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1];
  return { ...level, total, next, idx };
}

function getMaxCombo(logs) {
  const byDate = {};
  logs.forEach(l => {
    if (!byDate[l.date]) byDate[l.date] = new Set();
    byDate[l.date].add(l.category);
  });
  return Math.max(0, ...Object.values(byDate).map(s => s.size));
}

function getTodayCombo(logs) {
  const today = TODAY();
  return new Set(logs.filter(l => l.date === today).map(l => l.category)).size;
}

function getWeekData(logs) {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates.map(date => {
    const data = {};
    CATEGORIES.forEach(c => { data[c.id] = 0; });
    logs.filter(l => l.date === date).forEach(l => { data[l.category] = (data[l.category] || 0) + l.amount; });
    const d = new Date(date);
    data.label = DAY_LABELS[d.getDay()];
    data.date = date;
    data.total = CATEGORIES.reduce((s, c) => s + data[c.id], 0);
    return data;
  });
}

function getWeekTotals(logs, offsetWeeks) {
  const dates = [];
  const now = new Date();
  const startOffset = offsetWeeks * 7 + 6;
  const endOffset = offsetWeeks * 7;
  for (let i = startOffset; i >= endOffset; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  const t = {};
  CATEGORIES.forEach(c => { t[c.id] = 0; });
  logs.filter(l => dates.includes(l.date)).forEach(l => { t[l.category] = (t[l.category] || 0) + l.amount; });
  return t;
}

function getMonthSummary(logs) {
  const now = new Date();
  const m = now.getMonth(), yr = now.getFullYear();
  const t = {};
  logs.filter(l => { const d = new Date(l.date); return d.getMonth() === m && d.getFullYear() === yr; })
    .forEach(l => { t[l.category] = (t[l.category] || 0) + l.amount; });
  return t;
}

function getHeatmapData(logs) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 83);
  const days = [];
  const d = new Date(start);
  while (d <= now) {
    const ds = d.toISOString().split("T")[0];
    const count = logs.filter(l => l.date === ds).reduce((s, l) => s + l.amount, 0);
    days.push({ date: ds, count, dow: d.getDay() });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getTimeline(logs) {
  return logs.filter(l => l.date === TODAY()).sort((a, b) => a.time - b.time);
}

const AnimNum = ({ value, duration = 800 }) => {
  const [disp, setDisp] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const s = prev.current;
    const diff = value - s;
    if (diff === 0) { setDisp(value); return; }
    const st = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - st) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(s + diff * e));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{disp}</span>;
};

export default function App() {
  const [logs, setLogs] = useState(() => loadLogs());
  const [activeTab, setActiveTab] = useState("record");
  const [addAmount, setAddAmount] = useState({});
  const [particleCat, setParticleCat] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [comboPopup, setComboPopup] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [gachaSpinning, setGachaSpinning] = useState(false);

  const [todayChallenge] = useState(() => {
    const seed = TODAY().split("-").join("");
    return CHALLENGES[parseInt(seed) % CHALLENGES.length];
  });

  useEffect(() => { saveLogs(logs); }, [logs]);

  const totals = useMemo(() => getTotals(logs), [logs]);
  const streak = useMemo(() => getStreak(logs), [logs]);
  const level = useMemo(() => getLevel(totals), [totals]);
  const weekData = useMemo(() => getWeekData(logs), [logs]);
  const thisWeek = useMemo(() => getWeekTotals(logs, 0), [logs]);
  const lastWeek = useMemo(() => getWeekTotals(logs, 1), [logs]);
  const monthSummary = useMemo(() => getMonthSummary(logs), [logs]);
  const maxCombo = useMemo(() => getMaxCombo(logs), [logs]);
  const todayCombo = useMemo(() => getTodayCombo(logs), [logs]);
  const heatmap = useMemo(() => getHeatmapData(logs), [logs]);
  const timeline = useMemo(() => getTimeline(logs), [logs]);
  const unlockedAch = useMemo(() => {
    const state = { totals, streak, maxCombo };
    return ACHIEVEMENTS.filter(a => a.check(state));
  }, [totals, streak, maxCombo]);

  const todayLogs = useMemo(() => {
    const t = {};
    logs.filter(l => l.date === TODAY()).forEach(l => { t[l.category] = (t[l.category] || 0) + l.amount; });
    return t;
  }, [logs]);

  const addLog = useCallback((catId, amount) => {
    if (!amount || amount <= 0) return;
    const newLog = { category: catId, amount, date: TODAY(), time: Date.now() };
    const newLogs = [...logs, newLog];
    const oldState = { totals, streak, maxCombo };
    const nt = getTotals(newLogs);
    const ns = getStreak(newLogs);
    const nm = getMaxCombo(newLogs);
    const newState = { totals: nt, streak: ns, maxCombo: nm };
    const oldIds = ACHIEVEMENTS.filter(a => a.check(oldState)).map(a => a.id);
    const justUnlocked = ACHIEVEMENTS.find(a => a.check(newState) && !oldIds.includes(a.id));
    const oldCombo = getTodayCombo(logs);
    const tempCombo = getTodayCombo(newLogs);

    setLogs(newLogs);
    setParticleCat(catId);
    setTimeout(() => setParticleCat(null), 100);
    setAddAmount(prev => ({ ...prev, [catId]: "" }));

    if (tempCombo > oldCombo && tempCombo >= 2) {
      setTimeout(() => { setComboPopup(tempCombo); setTimeout(() => setComboPopup(null), 2000); }, 300);
    }
    if (justUnlocked) {
      setTimeout(() => { setNewAchievement(justUnlocked); setTimeout(() => setNewAchievement(null), 3500); }, 600);
    }
  }, [logs, totals, streak, maxCombo]);

  const removeLog = useCallback((catId, amount) => {
    if (!amount || amount <= 0) return;
    const today = TODAY();
    let remaining = amount;
    const newLogs = [...logs];
    for (let i = newLogs.length - 1; i >= 0 && remaining > 0; i--) {
      if (newLogs[i].category === catId && newLogs[i].date === today) {
        if (newLogs[i].amount <= remaining) {
          remaining -= newLogs[i].amount;
          newLogs.splice(i, 1);
        } else {
          newLogs[i] = { ...newLogs[i], amount: newLogs[i].amount - remaining };
          remaining = 0;
        }
      }
    }
    setLogs(newLogs);
  }, [logs]);

  const deleteLogEntry = useCallback((time) => {
    setLogs(prev => prev.filter(l => l.time !== time));
  }, []);

  const runGacha = useCallback(() => {
    if (gachaSpinning) return;
    setGachaSpinning(true);
    setGachaResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setGachaResult(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setGachaSpinning(false);
        setGachaResult(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
      }
    }, 120);
  }, [gachaSpinning]);

  const radarData = useMemo(() => {
    const max = Math.max(...CATEGORIES.map(c => monthSummary[c.id] || 0), 1);
    return CATEGORIES.map(c => ({ ...c, value: (monthSummary[c.id] || 0) / max, raw: monthSummary[c.id] || 0 }));
  }, [monthSummary]);

  const heatmapMax = useMemo(() => Math.max(...heatmap.map(d => d.count), 1), [heatmap]);

  const weeklyReport = useMemo(() => {
    return CATEGORIES.map(c => {
      const tw = thisWeek[c.id] || 0;
      const lw = lastWeek[c.id] || 0;
      const pct = lw === 0 ? (tw > 0 ? 100 : 0) : Math.round(((tw - lw) / lw) * 100);
      return { ...c, thisWeek: tw, lastWeek: lw, pct };
    });
  }, [thisWeek, lastWeek]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0a1a 0%, #111133 40%, #1a0a2e 100%)",
      color: "#e0e0f0",
      fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop-in { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes achievement-in {
          0% { transform: translateY(-100px) scale(0.5); opacity: 0; }
          50% { transform: translateY(10px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes combo-in {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes combo-out { to { transform: scale(0.5) translateY(-40px); opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes streak-fire { 0%,100% { text-shadow: 0 0 10px #ff6b6b, 0 0 20px #ff6b6b; } 50% { text-shadow: 0 0 20px #ff6b6b, 0 0 40px #ff4444, 0 0 60px #ff0000; } }
        @keyframes bar-fill { from { width: 0%; } }
        @keyframes bg-float { 0%,100% { transform: translate(0,0); } 33% { transform: translate(30px,-30px); } 66% { transform: translate(-20px,20px); } }
        @keyframes particle-burst {
          0% { opacity: 1; transform: translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
        @keyframes gacha-glow {
          0%,100% { box-shadow: 0 0 20px rgba(167,139,250,0.3); }
          50% { box-shadow: 0 0 50px rgba(167,139,250,0.8), 0 0 80px rgba(255,107,107,0.3); }
        }
        @keyframes heatmap-pop { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes timeline-line { from { height: 0; } to { height: 100%; } }
        .tab-btn { padding: 10px 16px; border: none; background: rgba(255,255,255,0.05); color: #888; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s; font-family: inherit; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
        .tab-btn.active { background: rgba(255,255,255,0.15); color: #fff; box-shadow: 0 0 20px rgba(255,255,255,0.1); }
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.1); color: #bbb; }
        .cat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; position: relative; overflow: hidden; transition: all 0.3s; animation: slide-up 0.5s ease backwards; }
        .cat-card:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); border-color: rgba(255,255,255,0.15); }
        .add-btn { padding: 8px 18px; border: none; border-radius: 10px; color: #fff; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.2s; font-family: inherit; -webkit-tap-highlight-color: transparent; }
        .add-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
        .add-btn:active { transform: scale(0.95); }
        .quick-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #ccc; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-family: inherit; -webkit-tap-highlight-color: transparent; }
        .quick-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.1); }
        .quick-btn:active { transform: scale(0.9); }
        .amount-input { width: 56px; padding: 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: #fff; text-align: center; font-size: 16px; outline: none; font-family: inherit; }
        .amount-input:focus { border-color: rgba(255,255,255,0.4); box-shadow: 0 0 15px rgba(255,255,255,0.1); }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; animation: slide-up 0.5s ease backwards; }
        .ach-badge { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; animation: pop-in 0.4s ease backwards; }
        .ach-badge.locked { opacity: 0.3; filter: grayscale(0.8); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
      `}</style>

      {/* BG orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[{ c: "rgba(255,107,107,0.06)", s: 400, x: "10%", y: "20%", d: "0s" },
          { c: "rgba(78,205,196,0.06)", s: 350, x: "70%", y: "60%", d: "3s" },
          { c: "rgba(167,139,250,0.05)", s: 300, x: "50%", y: "10%", d: "6s" }].map((o, i) => (
          <div key={i} style={{
            position: "absolute", left: o.x, top: o.y, width: o.s, height: o.s,
            background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
            borderRadius: "50%", animation: `bg-float 20s ease-in-out infinite`, animationDelay: o.d,
          }} />
        ))}
      </div>

      {/* Achievement popup */}
      {newAchievement && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100,
          background: "linear-gradient(135deg, #1a1a3e, #2a1a4e)", border: "2px solid #A78BFA",
          borderRadius: 20, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12,
          animation: "achievement-in 0.6s ease", boxShadow: "0 10px 40px rgba(167,139,250,0.4)", maxWidth: "90vw",
        }}>
          <span style={{ fontSize: 32, animation: "float 1s ease infinite" }}>{newAchievement.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 700, letterSpacing: 2 }}>実績解除!</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{newAchievement.label}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{newAchievement.desc}</div>
          </div>
        </div>
      )}

      {/* Combo popup */}
      {comboPopup && (
        <div style={{
          position: "fixed", top: "35%", left: "50%", transform: "translateX(-50%)", zIndex: 99,
          animation: "combo-in 0.5s ease, combo-out 0.5s ease 1.2s forwards", textAlign: "center",
        }}>
          <div style={{
            fontSize: 48, fontWeight: 900, fontFamily: "'Orbitron', sans-serif",
            background: "linear-gradient(135deg, #FF6B6B, #F59E0B, #4ECDC4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(255,107,107,0.5))",
          }}>{comboPopup}x</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
            {COMBO_LABELS[Math.min(comboPopup, 5)]}
          </div>
        </div>
      )}

      {/* Particles */}
      {particleCat && (() => {
        const cat = CATEGORIES.find(c => c.id === particleCat);
        return (
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}>
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const dist = 40 + Math.random() * 60;
              return (
                <div key={i} style={{
                  position: "absolute", left: "50%", top: "50%",
                  width: 6 + Math.random() * 6, height: 6 + Math.random() * 6,
                  borderRadius: "50%", backgroundColor: cat.color,
                  "--tx": `${Math.cos(angle) * dist}px`, "--ty": `${Math.sin(angle) * dist}px`,
                  animation: "particle-burst 0.7s ease-out forwards",
                }} />
              );
            })}
          </div>
        );
      })()}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", padding: "16px 16px 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900,
            background: "linear-gradient(135deg, #FF6B6B, #A78BFA, #4ECDC4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: 2,
          }}>OTAKU TRACKER</h1>
          <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>コンテンツ消費モチベーション管理</p>
        </div>

        {/* Level & Streak */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: "14px 18px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 26, animation: "float 2s ease infinite" }}>{level.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: "#888" }}>Lv.{level.idx + 1}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{level.title}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 18, fontWeight: 900, fontFamily: "'Orbitron', sans-serif",
                ...(streak >= 3 ? { animation: "streak-fire 2s ease infinite" } : {}),
              }}>🔥 <AnimNum value={streak} />日</div>
              <div style={{ fontSize: 10, color: "#888" }}>連続 | コンボ {todayCombo}/{CATEGORIES.length}</div>
            </div>
          </div>
          {level.next && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666", marginBottom: 3 }}>
                <span>累計 {level.total}</span>
                <span>次: {level.next.title} ({level.next.threshold})</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${Math.min((level.total / level.next.threshold) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #FF6B6B, #A78BFA, #4ECDC4)",
                  backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite, bar-fill 1s ease",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Challenge + Gacha */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{
            flex: 1, background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(236,72,153,0.08))",
            border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20, animation: "float 1.5s ease infinite" }}>🎲</span>
            <div>
              <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, letterSpacing: 1 }}>TODAY</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{todayChallenge}</div>
            </div>
          </div>
          <button onClick={runGacha} style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(236,72,153,0.15))",
            border: "1px solid rgba(167,139,250,0.25)", borderRadius: 14, padding: "10px 16px",
            color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
            transition: "all 0.3s", minWidth: 90, textAlign: "center",
            ...(gachaSpinning ? { animation: "gacha-glow 0.5s ease infinite" } : {}),
          }}>
            {gachaSpinning ? (gachaResult ? gachaResult.icon : "...") : gachaResult ? (
              <div>
                <div style={{ fontSize: 22 }}>{gachaResult.icon}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{gachaResult.label}</div>
              </div>
            ) : "🎰 ガチャ"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { id: "record", label: "📝 記録" },
            { id: "stats", label: "📊 統計" },
            { id: "heatmap", label: "🟩 草" },
            { id: "achievements", label: "🏆 実績" },
            { id: "monthly", label: "📅 月間" },
          ].map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {/* RECORD TAB */}
        {activeTab === "record" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat.id} className="cat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        今日: {todayLogs[cat.id] || 0}{cat.unit} ／ 累計: <AnimNum value={totals[cat.id] || 0} />{cat.unit}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <button className="quick-btn" style={{ color: "#FF6B6B", borderColor: "rgba(255,107,107,0.25)" }}
                    onClick={() => removeLog(cat.id, 1)}>-1</button>
                  {[1, 3, 5].map(n => (
                    <button key={n} className="quick-btn" onClick={() => addLog(cat.id, n)}>+{n}</button>
                  ))}
                  <input type="number" className="amount-input" placeholder="数"
                    value={addAmount[cat.id] || ""}
                    onChange={e => setAddAmount(p => ({ ...p, [cat.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") addLog(cat.id, parseFloat(addAmount[cat.id])); }}
                  />
                  <button className="add-btn" style={{ background: cat.bgGrad }}
                    onClick={() => addLog(cat.id, parseFloat(addAmount[cat.id]) || 1)}>記録</button>
                </div>
              </div>
            ))}

            {timeline.length > 0 && (
              <div className="stat-card" style={{ animationDelay: "0.4s" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>⏱ 今日のタイムライン</div>
                <div style={{ position: "relative", paddingLeft: 28 }}>
                  <div style={{
                    position: "absolute", left: 10, top: 4, bottom: 4, width: 2,
                    background: "linear-gradient(180deg, #FF6B6B, #A78BFA, #4ECDC4)",
                    borderRadius: 1, animation: "timeline-line 1s ease",
                  }} />
                  {timeline.map((log, i) => {
                    const cat = CATEGORIES.find(c => c.id === log.category);
                    const t = new Date(log.time);
                    const ts = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                        animation: `slide-up 0.3s ease ${i * 0.05}s backwards`,
                      }}>
                        <div style={{
                          position: "absolute", left: 5, width: 12, height: 12, borderRadius: "50%",
                          background: cat.color, border: "2px solid #0a0a1a",
                        }} />
                        <div style={{ fontSize: 11, color: "#666", minWidth: 40 }}>{ts}</div>
                        <span style={{ fontSize: 16 }}>{cat.icon}</span>
                        <span style={{ fontSize: 13, flex: 1 }}>{cat.label} +{log.amount}{cat.unit}</span>
                        <button onClick={() => deleteLogEntry(log.time)} style={{
                          background: "none", border: "none", color: "#555", cursor: "pointer",
                          fontSize: 14, padding: "4px 8px", borderRadius: 6,
                        }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CATEGORIES.map((cat, i) => (
                <div key={cat.id} className="stat-card" style={{ animationDelay: `${i * 0.07}s`, textAlign: "center" }}>
                  <span style={{ fontSize: 26 }}>{cat.icon}</span>
                  <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Orbitron', sans-serif", color: cat.color, margin: "6px 0 2px" }}>
                    <AnimNum value={totals[cat.id] || 0} />
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>{cat.unit}</div>
                  {cat.id === "anime" && (totals.anime || 0) > 0 && (
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>≈ {Math.round((totals.anime || 0) * 24 / 60)}時間</div>
                  )}
                </div>
              ))}
            </div>

            <div className="stat-card" style={{ animationDelay: "0.35s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📊 週間アクティビティ</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {weekData.map((day, i) => {
                  const maxW = Math.max(...weekData.map(d => d.total), 1);
                  const h = (day.total / maxW) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "#888" }}>{day.total > 0 ? day.total : ""}</div>
                      <div style={{
                        width: "100%", height: h || 3, borderRadius: 5,
                        background: day.total > 0 ? "linear-gradient(180deg, #FF6B6B, #A78BFA)" : "rgba(255,255,255,0.05)",
                        animation: day.total > 0 ? `bar-fill 0.8s ease ${i * 0.1}s backwards` : "none",
                      }} />
                      <div style={{ fontSize: 10, fontWeight: day.date === TODAY() ? 700 : 400, color: day.date === TODAY() ? "#FF6B6B" : "#666" }}>{day.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="stat-card" style={{ animationDelay: "0.5s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📈 週間レポート（先週比）</div>
              {weeklyReport.map((r, i) => (
                <div key={r.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: i < weeklyReport.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  animation: `slide-up 0.3s ease ${i * 0.06}s backwards`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{r.icon}</span>
                    <span style={{ fontSize: 13 }}>{r.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#888" }}>{r.thisWeek}{r.unit}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
                      background: r.pct > 0 ? "rgba(78,205,196,0.15)" : r.pct < 0 ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.05)",
                      color: r.pct > 0 ? "#4ECDC4" : r.pct < 0 ? "#FF6B6B" : "#888",
                    }}>
                      {r.pct > 0 ? `↑${r.pct}%` : r.pct < 0 ? `↓${Math.abs(r.pct)}%` : "→"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HEATMAP TAB */}
        {activeTab === "heatmap" && (
          <div className="stat-card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🟩 アクティビティ（過去12週）</div>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4 }}>
                {["", "月", "", "水", "", "金", ""].map((l, i) => (
                  <div key={i} style={{ width: 16, height: 14, fontSize: 9, color: "#555", display: "flex", alignItems: "center" }}>{l}</div>
                ))}
              </div>
              {(() => {
                const weeks = [];
                let week = Array(7).fill(null);
                heatmap.forEach((d, i) => {
                  if (i === 0) { for (let j = 0; j < d.dow; j++) week[j] = null; }
                  week[d.dow] = d;
                  if (d.dow === 6 || i === heatmap.length - 1) {
                    weeks.push([...week]);
                    week = Array(7).fill(null);
                  }
                });
                return weeks.map((w, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {w.map((d, di) => {
                      if (!d) return <div key={di} style={{ width: 14, height: 14 }} />;
                      const intensity = d.count / heatmapMax;
                      const bg = d.count === 0 ? "rgba(255,255,255,0.04)"
                        : intensity < 0.25 ? "rgba(78,205,196,0.2)"
                        : intensity < 0.5 ? "rgba(78,205,196,0.4)"
                        : intensity < 0.75 ? "rgba(78,205,196,0.65)" : "#4ECDC4";
                      return (
                        <div key={di} title={`${d.date}: ${d.count}`} style={{
                          width: 14, height: 14, borderRadius: 3, background: bg,
                          animation: `heatmap-pop 0.3s ease ${(wi * 7 + di) * 0.01}s backwards`,
                        }} />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10, color: "#555" }}>少</span>
              {[0.04, 0.2, 0.4, 0.65, 1].map((v, i) => (
                <div key={i} style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: v === 0.04 ? "rgba(255,255,255,0.04)" : v === 0.2 ? "rgba(78,205,196,0.2)" : v === 0.4 ? "rgba(78,205,196,0.4)" : v === 0.65 ? "rgba(78,205,196,0.65)" : "#4ECDC4",
                }} />
              ))}
              <span style={{ fontSize: 10, color: "#555" }}>多</span>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
              {unlockedAch.length} / {ACHIEVEMENTS.length} 解除済み
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${(unlockedAch.length / ACHIEVEMENTS.length) * 100}%`,
                background: "linear-gradient(90deg, #F59E0B, #EC4899)", animation: "bar-fill 1s ease",
              }} />
            </div>
            {ACHIEVEMENTS.map((a, i) => {
              const unlocked = unlockedAch.some(u => u.id === a.id);
              return (
                <div key={a.id} className={`ach-badge ${unlocked ? "" : "locked"}`} style={{ animationDelay: `${i * 0.04}s` }}>
                  <span style={{ fontSize: 26 }}>{unlocked ? a.icon : "🔒"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{a.desc}</div>
                  </div>
                  {unlocked && <span style={{ color: "#4ECDC4", fontSize: 16 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MONTHLY TAB */}
        {activeTab === "monthly" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="stat-card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                📅 {new Date().getMonth() + 1}月のまとめ
              </div>
              {CATEGORIES.map((cat, i) => {
                const val = monthSummary[cat.id] || 0;
                const max = Math.max(...Object.values(monthSummary), 1);
                return (
                  <div key={cat.id} style={{ marginBottom: 12, animation: `slide-up 0.4s ease ${i * 0.07}s backwards` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span>{cat.icon} {cat.label}</span>
                      <span style={{ fontWeight: 700, color: cat.color }}>{val}{cat.unit}</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4, background: cat.bgGrad,
                        width: `${(val / max) * 100}%`, animation: `bar-fill 0.8s ease ${i * 0.1}s backwards`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="stat-card" style={{ animationDelay: "0.2s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🎯 バランスチェック</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {radarData.map((cat, i) => (
                  <div key={cat.id} style={{ width: 85, textAlign: "center", animation: `pop-in 0.4s ease ${i * 0.08}s backwards` }}>
                    <div style={{
                      width: 58, height: 58, borderRadius: "50%", margin: "0 auto 4px",
                      background: `conic-gradient(${cat.color} ${cat.value * 360}deg, rgba(255,255,255,0.06) 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%", background: "#111133",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                      }}>{cat.icon}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#888" }}>{cat.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{cat.raw}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data management */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button onClick={() => {
            if (confirm("全データをリセットしますか？")) {
              setLogs([]);
              localStorage.removeItem(STORAGE_KEY);
            }
          }} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            color: "#555", padding: "8px 20px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
          }}>
            🗑 データリセット
          </button>
        </div>
      </div>
    </div>
  );
}
