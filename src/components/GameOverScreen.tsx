'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Heart, Frown, PartyPopper, RotateCcw, Share2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { getSpeakerByVoiceType } from '@/types/game';
import { Button } from '@/components/ui/button';

// 撒花动画组件
function Confetti() {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

  // ⚠️ 使用 useMemo 避免每次渲染时调用 Math.random()
  const confettiPieces = useMemo(() => {
    // 使用固定种子生成伪随机数
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: seededRandom(i * 7) * 100,
      delay: seededRandom(i * 11) * 2,
      duration: 2 + seededRandom(i * 13) * 2,
      color: colors[Math.floor(seededRandom(i * 17) * colors.length)],
      size: 8 + seededRandom(i * 19) * 8,
      isRound: seededRandom(i * 23) > 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-bounce"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.isRound ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

// 心碎动画组件
function BrokenHeart() {
  return (
    <div className="relative">
      <Heart className="w-24 h-24 text-red-400 fill-red-400 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-0.5 bg-gray-400 rotate-45 absolute" />
        <div className="w-16 h-0.5 bg-gray-400 -rotate-45 absolute" />
      </div>
    </div>
  );
}

export default function GameOverScreen() {
  const { gameState, resetGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [endMessage, setEndMessage] = useState('');
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 播放音频
  const playAudio = useCallback(() => {
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
      console.error('[GameOverScreen] Audio play error:', error);
      setIsPlaying(false);
    });
  }, [audioUri]);

  // 清理文本中的括号内容
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[「」『』]/g, '')
      .trim();
  };

  // 生成结束语
  useEffect(() => {
    const generateEndMessage = async () => {
      if (gameState.won) {
        const successMessages = gameState.gender === 'female'
          ? [
              '好吧好吧，看在你这么用心的份上，我就原谅你这一次啦！但下次绝对不许再犯了哦～',
              '哼，勉强原谅你了。以后要对我好一点知道吗！',
              '算你还有点良心，这次就放过你。下次再这样，我可不会这么好说话了！',
            ]
          : [
              '行吧，看你这么诚恳的份上，这次就算了。不过你给我记好了！',
              '哼，算你会说话。这件事就这么过去了，别再提了。',
              '好吧好吧，原谅你了。不过你欠我的，下次记得还！',
            ];
        const message = successMessages[Math.floor(Math.random() * successMessages.length)];
        setEndMessage(message);
        setShowConfetti(true);

        // 生成语音
        if (gameState.voiceType) {
          try {
            const speaker = getSpeakerByVoiceType(gameState.voiceType);
            const uid = `gameover-${Date.now()}`;
            const cleanText = cleanTextForSpeech(message);

            const response = await fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: cleanText, speaker, uid }),
            });

            if (response.ok) {
              const data = await response.json();
              setAudioUri(data.audioUri);
            }
          } catch (error) {
            console.error('[GameOverScreen] TTS Error:', error);
          }
        }
      } else {
        const failMessages = gameState.gender === 'female'
          ? [
              '我真的累了...我们还是先冷静一下吧。',
              '你根本不懂我想要的是什么。',
              '算了，跟你说也没用。',
            ]
          : [
              '我不想再说了，我们需要冷静一下。',
              '你每次都这样，我已经不想再解释了。',
              '行吧，随便你怎么想。',
            ];
        const message = failMessages[Math.floor(Math.random() * failMessages.length)];
        setEndMessage(message);
      }
    };

    generateEndMessage();
  }, [gameState.won, gameState.gender, gameState.voiceType]);

  // 清理音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // 分享功能
  const handleShare = async () => {
    const text = gameState.won
      ? '我在哄哄模拟器中成功把TA哄好了！快来试试你能哄好你的另一半吗？'
      : '我在哄哄模拟器中失败了...看来我还不够了解TA。你敢来挑战吗？';

    if (navigator.share) {
      try {
        await navigator.share({
          title: '哄哄模拟器',
          text,
          url: window.location.href,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        alert('链接已复制到剪贴板！');
      } catch {
        alert('分享失败，请手动复制链接');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4 relative">
      {/* 撒花动画 - 胜利时显示 */}
      {showConfetti && <Confetti />}

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        {/* 图标 */}
        <div className="flex justify-center">
          {gameState.won ? (
            <div className="relative">
              <PartyPopper className="w-20 h-20 text-yellow-500" />
              <Heart
                className="w-12 h-12 text-pink-500 fill-pink-500 absolute -bottom-2 -right-4 animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          ) : (
            <BrokenHeart />
          )}
        </div>

        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {gameState.won ? '通关成功！' : '游戏结束'}
          </h1>
          <p className="text-gray-500 mt-2">
            {gameState.won
              ? '恭喜你成功哄好了TA！'
              : '看来这次没能哄好TA...'}
          </p>
        </div>

        {/* 结束对话 */}
        <div className="bg-gray-50 rounded-xl p-4 text-gray-700 italic">
          "{endMessage}"
        </div>

        {/* 语音播放按钮 */}
        {audioUri && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
              } else {
                playAudio();
              }
            }}
          >
            <Heart className={cn('w-4 h-4 mr-2', isPlaying && 'fill-current')} />
            {isPlaying ? '播放中...' : '播放语音'}
          </Button>
        )}

        {/* 统计信息 */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {gameState.step}
            </div>
            <div className="text-gray-500">轮数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {gameState.affection}
            </div>
            <div className="text-gray-500">好感度</div>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            onClick={resetGame}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            再玩一次
          </Button>

          {gameState.won && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享给朋友
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// 工具函数
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
