'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import {
  getSpeakerByVoiceType,
  MAX_AFFECTION,
  MIN_AFFECTION,
  MAX_ROUNDS,
  ChatRequest,
  Option,
} from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 加载动画组件
function LoadingAnimation({ gender }: { gender: 'female' | 'male' | null }) {
  const pronoun = gender === 'female' ? '她' : '他';
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-pulse">
      <div className="flex gap-1">
        <Heart
          className="w-6 h-6 text-pink-500 fill-pink-500 animate-bounce"
          style={{ animationDelay: '0s' }}
        />
        <Heart
          className="w-6 h-6 text-pink-400 fill-pink-400 animate-bounce"
          style={{ animationDelay: '0.1s' }}
        />
        <Heart
          className="w-6 h-6 text-pink-300 fill-pink-300 animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {pronoun}正在思考...
      </p>
    </div>
  );
}

// 好感度进度条
function AffectionBar({
  affection,
  min,
  max,
}: {
  affection: number;
  min: number;
  max: number;
}) {
  const percentage = ((affection - min) / (max - min)) * 100;

  // 根据好感度返回颜色
  const getColor = () => {
    if (affection < 0) return '#ef4444'; // 红色
    if (affection < 50) return '#eab308'; // 黄色
    if (affection < 80) return '#3b82f6'; // 蓝色
    return '#22c55e'; // 绿色
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>生气</span>
        <span>原谅</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(0, Math.min(100, percentage))}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
}

// 对话气泡
function MessageBubble({
  message,
  isUser,
  gender,
  onPlayAudio,
  isPlaying,
}: {
  message: { role: string; content: string };
  isUser: boolean;
  gender: 'female' | 'male' | null;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}) {
  const pronoun = gender === 'female' ? 'TA' : 'TA';

  return (
    <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
      {/* 头像 */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          isUser ? 'bg-blue-500 text-white' : 'bg-pink-400 text-white'
        )}
      >
        {isUser ? '我' : pronoun}
      </div>

      {/* 消息内容 */}
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={cn(
            'px-4 py-2 rounded-2xl text-sm',
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
          )}
        >
          {message.content}
        </div>

        {/* 语音播放按钮 - 仅对方消息显示 */}
        {!isUser && onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className={cn(
              'flex items-center gap-1 text-xs text-gray-500 hover:text-pink-500 transition-colors self-start',
              isPlaying && 'text-pink-500'
            )}
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>{isPlaying ? '播放中' : '播放'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function GameScreen() {
  const { gameState, selectOption, addPartnerMessage, resetGame } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioMessageId, setCurrentAudioMessageId] = useState<string | null>(null);
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(false);
  const lastGeneratedStepRef = useRef(0);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 清理文本中的括号内容
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[「」『』]/g, '')
      .trim();
  };

  // 生成语音
  const generateAudio = useCallback(
    async (text: string) => {
      if (!text) return;

      if (useWebSpeech || !gameState.voiceType) {
        return;
      }

      try {
        const speaker = getSpeakerByVoiceType(gameState.voiceType);
        const uid = `game-${Date.now()}`;

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, speaker, uid }),
        });

        if (response.ok) {
          const data = await response.json();
          setAudioUri(data.audioUri);
        } else {
          console.log('[GameScreen] TTS API failed, falling back to Web Speech');
          setUseWebSpeech(true);
        }
      } catch (error) {
        console.error('[GameScreen] TTS Error:', error);
        setUseWebSpeech(true);
      }
    },
    [gameState.voiceType, useWebSpeech]
  );

  // 使用 Web Speech API 播放
  const playWebSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 停止当前播放
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = gameState.gender === 'female' ? 1.2 : 0.9;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = window.speechSynthesis;
  }, [gameState.gender]);

  // 播放音频
  const playAudio = useCallback((text?: string) => {
    if (useWebSpeech && text) {
      if (isPlaying) {
        speechSynthesisRef.current?.cancel();
        setIsPlaying(false);
      } else {
        playWebSpeech(text);
      }
      return;
    }

    if (!audioUri) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUri);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);

    audio.play().catch((error) => {
      console.error('[GameScreen] Audio play error:', error);
      setIsPlaying(false);
    });
  }, [audioUri, useWebSpeech, isPlaying, playWebSpeech]);

  // 生成下一轮对话
  const generateNextRound = useCallback(async () => {
    // ⚠️ 防止重复生成
    if (
      isGeneratingRef.current ||
      isLoading ||
      gameState.gameOver ||
      gameState.step === lastGeneratedStepRef.current
    ) {
      return;
    }

    // 如果没有消息或上一轮已选择选项，需要生成新对话
    const lastMessage = gameState.messages[gameState.messages.length - 1];
    const needsPartnerResponse =
      !lastMessage ||
      lastMessage.role === 'user';

    if (!needsPartnerResponse && gameState.currentOptions.length > 0) {
      return;
    }

    isGeneratingRef.current = true;
    setIsLoading(true);

    // 设置超时保护，3秒后强制结束加载
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('[GameScreen] Generation timeout, forcing stop');
        setIsLoading(false);
        isGeneratingRef.current = false;
      }
    }, 3000);

    try {
      const requestBody: ChatRequest = {
        gender: gameState.gender!,
        scenario: gameState.scenario!.title,
        messages: gameState.messages,
        affection: gameState.affection,
        step: gameState.step,
        isGameOver: gameState.gameOver,
        won: gameState.won,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        addPartnerMessage(data.partnerMessage, data.options);
        lastGeneratedStepRef.current = gameState.step;
      } else {
        console.error('[GameScreen] Chat API error:', response.status);
        // API 失败也用降级方案
        const defaultData = await response.json().catch(() => null);
        if (defaultData?.partnerMessage) {
          addPartnerMessage(defaultData.partnerMessage, defaultData.options || []);
        }
      }
    } catch (error) {
      console.error('[GameScreen] Generate error:', error);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      isGeneratingRef.current = false;
    }
  }, [
    gameState.gender,
    gameState.scenario,
    gameState.messages,
    gameState.affection,
    gameState.step,
    gameState.gameOver,
    gameState.won,
    gameState.currentOptions.length,
    isLoading,
    addPartnerMessage,
  ]);

  // 处理选项选择
  const handleSelectOption = useCallback(
    async (option: Option) => {
      // 重置语音状态
      setAudioUri(undefined);
      setCurrentAudioMessageId(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      speechSynthesisRef.current?.cancel();
      setIsPlaying(false);

      // 选择选项
      selectOption(option);
      lastGeneratedStepRef.current = 0; // 重置，用于生成下一轮
    },
    [selectOption]
  );

  // 监听消息变化，生成语音
  useEffect(() => {
    const partnerMessages = gameState.messages.filter(
      (m) => m.role === 'partner'
    );
    const lastPartnerMessage = partnerMessages[partnerMessages.length - 1];

    if (lastPartnerMessage && gameState.voiceType) {
      const messageId = `${lastPartnerMessage.role}-${lastPartnerMessage.content}`;

      // ⚠️ 关键实现要点：检测新消息，生成新语音
      if (currentAudioMessageId !== messageId) {
        setAudioUri(undefined);
        setCurrentAudioMessageId(messageId);

        const cleanText = cleanTextForSpeech(lastPartnerMessage.content);
        if (cleanText) {
          generateAudio(cleanText);
        }
      }
    }
  }, [
    gameState.messages,
    gameState.voiceType,
    currentAudioMessageId,
    generateAudio,
  ]);

  // 监听轮次变化，生成对话
  useEffect(() => {
    if (gameState.step > 0 && !gameState.gameOver) {
      generateNextRound();
    }
  }, [gameState.step, gameState.gameOver, generateNextRound]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [gameState.messages, scrollToBottom]);

  // 清理音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // 游戏结束，跳转到结束界面
  useEffect(() => {
    if (gameState.gameOver) {
      // 延迟一下，让用户看到最后一轮的结果
      const timer = setTimeout(() => {
        window.location.hash = 'gameover';
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100 flex flex-col">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* 轮次显示 */}
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">
              第 {gameState.step} 轮 / 共 {MAX_ROUNDS} 轮
            </span>
            {gameState.scenario && (
              <span className="text-purple-600">{gameState.scenario.title}</span>
            )}
          </div>

          {/* 好感度进度条 */}
          <AffectionBar
            affection={gameState.affection}
            min={MIN_AFFECTION}
            max={MAX_AFFECTION}
          />
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* 消息列表 */}
          {gameState.messages.map((message, index) => (
            <MessageBubble
              key={`${message.role}-${index}`}
              message={message}
              isUser={message.role === 'user'}
              gender={gameState.gender}
              onPlayAudio={
                message.role === 'partner'
                  ? () => {
                      if (isPlaying) {
                        audioRef.current?.pause();
                        setIsPlaying(false);
                      } else {
                        playAudio();
                      }
                    }
                  : undefined
              }
              isPlaying={
                message.role === 'partner' && isPlaying
              }
            />
          ))}

          {/* 加载动画 */}
          {isLoading && <LoadingAnimation gender={gameState.gender} />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部选项区域 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t shadow-lg p-4">
        <div className="max-w-2xl mx-auto">
          {/* 选项按钮 */}
          {gameState.currentOptions.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 gap-2">
              {gameState.currentOptions.map((option, index) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className={cn(
                    'w-full text-left h-auto py-3 px-4 justify-start whitespace-normal',
                    'hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700',
                    'transition-all duration-200'
                  )}
                  onClick={() => handleSelectOption(option)}
                >
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  <span>{option.content}</span>
                </Button>
              ))}
            </div>
          )}

          {/* 重新开始按钮 */}
          <Button
            variant="ghost"
            className="w-full mt-2 text-gray-500"
            onClick={resetGame}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重新开始
          </Button>
        </div>
      </div>
    </div>
  );
}
