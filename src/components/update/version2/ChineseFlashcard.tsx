import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';

import zw01 from '../../data/1_100.json';
import zw02 from '../../data/101_200.json';
import zw03 from '../../data/201_300.json';
import zw04 from '../../data/301_400.json';
import zw05 from '../../data/401_500.json';
import zw06 from '../../data/501_600.json';
import zw07 from '../../data/601_700.json';
import zw08 from '../../data/701_800.json';
import zw09 from '../../data/801_900.json';
import zw10 from '../../data/901_1000.json';

import math01 from '../../data/math_1_50.json';
import math02 from '../../data/math_51_69.json';
import wuli01 from '../../data/wuli_1_30.json';
import wuli02 from '../../data/wuli_31_60.json';
import wuli03 from '../../data/wuli_61_85.json';

// --- Data Structure ---

interface VocabularyItem {
  id: number;
  hanzi: string;
  pinyin: string;
  english: string;
  sentence: string;
  sentencePinyin: string;
  sentenceMeaning: string;
}

// --- Vocabulary Sets ---

const vocabularySets: { id: string; label: string; data: VocabularyItem[] }[] = [
  {
    id: 'batch1',
    label: '基础1–100',
    data: zw01,
  },
  {
    id: 'batch2',
    label: '基础101–200',
    data: zw02,
  },
  {
    id: 'batch3',
    label: '基础201–300',
    data: zw03,
  },
  {
    id: 'batch4',
    label: '基础301–400',
    data: zw04,
  },
  {
    id: 'batch5',
    label: '基础401–500',
    data: zw05,
  },
  {
    id: 'batch6',
    label: '基础501–600',
    data: zw06,
  },
  {
    id: 'batch7',
    label: '基础601–700',
    data: zw07,
  },
  {
    id: 'batch8',
    label: '基础701–800',
    data: zw08,
  },
  {
    id: 'batch9',
    label: '基础801–900',
    data: zw09,
  },
  {
    id: 'batch10',
    label: '基础901–1000',
    data: zw10,
  },
  {
    id: 'batch11',
    label: 'wuLi',
    data: wuli01,
  },
  {
    id: 'batch12',
    label: 'Wuli31-60',
    data: wuli02,
  },
  {
    id: 'batch13',
    label: 'wuli61-85',
    data: wuli03,
  },
  {
    id: 'batch14',
    label: 'math1-50',
    data: math01,
  },
  {
    id: 'batch15',
    label: 'math51-69',
    data: math02,
  },
];

export default function ChineseFlashcardApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [chineseVoice, setChineseVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  // NEW: which vocabulary set is active
  const [activeSetId, setActiveSetId] = useState<string>(vocabularySets[0].id);

  // NEW: state for jump-to-ID input
  const [jumpId, setJumpId] = useState<string>("");

  // Derive the active vocabulary list from the selected set
  const activeSet = vocabularySets.find(set => set.id === activeSetId) ?? vocabularySets[0];
  const vocabularyList = activeSet.data;

  // Guard against empty list
  const safeIndex = Math.min(currentIndex, Math.max(vocabularyList.length - 1, 0));
  const currentCard = vocabularyList[safeIndex];

  const minId = vocabularyList[0]?.id ?? 1;
  const maxId = vocabularyList[vocabularyList.length - 1]?.id ?? 1;

  // Reset index + jump input when set changes
  useEffect(() => {
    setCurrentIndex(0);
    setJumpId("");
  }, [activeSetId]);

  // Initialize Speech Synthesis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const zhVoice = availableVoices.find(
        (v) => v.lang === 'zh-CN' || v.lang === 'zh-TW' || v.name.includes('Chinese')
      );
      setChineseVoice(zhVoice || null);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle Speak Function
  const speak = (text: string, slow: boolean = false) => {
    if (!chineseVoice && voices.length > 0) {
      const zhVoice = voices.find(
        (v) => v.lang === 'zh-CN' || v.lang === 'zh-TW' || v.name.includes('Chinese')
      );
      if (zhVoice) setChineseVoice(zhVoice);
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = slow ? 0.6 : 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  // Auto-play audio when card changes if enabled
  useEffect(() => {
    if (!currentCard) return;
    if (autoPlay) {
      const timer = setTimeout(() => {
        speak(currentCard.hanzi);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [safeIndex, autoPlay, currentCard?.hanzi]);

  const handleNext = () => {
    if (safeIndex < vocabularyList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  // Jump to a specific word ID (within the active list)
  const handleJumpToId = () => {
    if (!jumpId.trim()) return;

    const idNumber = Number(jumpId);
    if (Number.isNaN(idNumber)) return;

    const index = vocabularyList.findIndex((item) => item.id === idNumber);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  // Handle empty list edge case
  if (!currentCard) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">Chinese Core Vocabulary</h1>
          </div>
        </header>
        <p className="text-slate-500">No words in the selected set.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight">Chinese Core Vocabulary</h1>
        </div>

        {/* NEW: vocabulary set select */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-500">
          <span className="font-medium">Vocabulary set:</span>
          <select
            value={activeSetId}
            onChange={(e) => setActiveSetId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {vocabularySets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-slate-500 mt-2 text-sm">
          Daniel Ding 学好中文，好幸运
        </p>
      </header>

      {/* Card Container */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100">
          <div
            className="bg-red-500 h-2 transition-all duration-300"
            style={{ width: `${((safeIndex + 1) / vocabularyList.length) * 100}%` }}
          />
        </div>

        {/* Card Header (Counter + Jump Control) */}
        <div className="flex flex-col gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">
              Card {safeIndex + 1} / {vocabularyList.length} &nbsp;
              (ID: {currentCard.id})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  autoPlay
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
                }`}
              >
                Auto-play {autoPlay ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  showPinyin
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
                }`}
              >
                Pinyin {showPinyin ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Jump-to-ID input */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold whitespace-nowrap">
              Jump to ID:
            </span>
            <input
              type="number"
              min={minId}
              max={maxId}
              value={jumpId}
              onChange={(e) => setJumpId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJumpToId();
              }}
              className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder={`${minId}-${maxId}`}
            />
            <button
              onClick={handleJumpToId}
              className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Go
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Main Character */}
          <div
            className="relative group cursor-pointer mb-2"
            onClick={() => speak(currentCard.hanzi)}
          >
            <h2 className="text-8xl font-black text-slate-800 mb-2 transition-transform transform group-hover:scale-105">
              {currentCard.hanzi}
            </h2>
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Volume2 className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Pinyin */}
          <div className="mb-6">
            {showPinyin ? (
              <p className="text-2xl text-red-500 font-serif font-medium tracking-wide">
                {currentCard.pinyin}
              </p>
            ) : (
              <p className="text-2xl text-slate-300 font-serif font-medium tracking-wide select-none">
                ••••
              </p>
            )}
          </div>

          <hr className="w-16 border-2 border-slate-100 mb-6 rounded-full" />

          {/* Definition */}
          <div className="mb-8 w-full">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
              Definition
            </h3>
            <p className="text-xl font-medium text-slate-700">{currentCard.english}</p>
          </div>

          {/* Example Sentence Box */}
          <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 text-left relative group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Example
              </h3>
              <button
                onClick={() => speak(currentCard.sentence)}
                className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                aria-label="Play Sentence Audio"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-lg text-slate-800 mb-1 font-medium">
              {currentCard.sentence}
            </p>
            {showPinyin && (
              <p className="text-sm text-slate-500 italic mb-2 font-serif">
                {currentCard.sentencePinyin}
              </p>
            )}
            <p className="text-sm text-slate-600">
              {currentCard.sentenceMeaning}
            </p>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {/* Left Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={safeIndex === 0}
              className={`p-2 rounded-full border ${
                safeIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Previous Card"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
              aria-label="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Right Button */}
          <div>
            <button
              onClick={handleNext}
              disabled={safeIndex === vocabularyList.length - 1}
              className={`p-2 rounded-full border ${
                safeIndex === vocabularyList.length - 1
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Next Card"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Tip */}
      <div className="mt-6 text-center text-slate-400 text-sm max-w-xs">
        <p>
          Tip: Click the Chinese character to hear pronunciation again. Use “Jump to ID”
          to start from any word. Use the dropdown to switch vocabulary sets.
        </p>
      </div>
    </div>
  );
}
