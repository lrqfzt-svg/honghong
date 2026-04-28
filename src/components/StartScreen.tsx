'use client';

import { useState } from 'react';
import { Heart, Users, MapPin, Mic } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import {
  SCENARIOS,
  VOICE_CONFIGS,
  Gender,
  VoiceType,
  getVoicesByGender,
} from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StartScreen() {
  const { gameState, setGender, setScenario, setVoiceType, startGame } = useGame();
  const [showError, setShowError] = useState(false);

  const handleStartGame = () => {
    if (!gameState.gender || !gameState.scenario || !gameState.voiceType) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setShowError(false);
    startGame();
  };

  const availableVoices = gameState.gender
    ? getVoicesByGender(gameState.gender)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-pulse" />
              <Heart
                className="w-8 h-8 text-red-400 fill-red-400 absolute -top-2 -right-4 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            哄哄模拟器
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            在10轮内把生气的TA哄好！
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 性别选择 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              <span>选择对方性别</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={gameState.gender === 'female' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  gameState.gender === 'female' &&
                    'bg-pink-500 hover:bg-pink-600'
                )}
                onClick={() => {
                  setGender('female');
                  setVoiceType(null as unknown as VoiceType);
                }}
              >
                女
              </Button>
              <Button
                variant={gameState.gender === 'male' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  gameState.gender === 'male' && 'bg-blue-500 hover:bg-blue-600'
                )}
                onClick={() => {
                  setGender('male');
                  setVoiceType(null as unknown as VoiceType);
                }}
              >
                男
              </Button>
            </div>
          </div>

          {/* 场景选择 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>选择场景</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SCENARIOS.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant={
                    gameState.scenario?.id === scenario.id ? 'default' : 'outline'
                  }
                  className={cn(
                    'justify-start h-auto py-3 text-left',
                    gameState.scenario?.id === scenario.id &&
                      'bg-purple-500 hover:bg-purple-600'
                  )}
                  onClick={() => setScenario(scenario)}
                >
                  <div>
                    <div className="font-medium">{scenario.title}</div>
                    <div className="text-xs opacity-80">{scenario.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* 语音选择 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mic className="w-4 h-4" />
              <span>选择声音</span>
            </div>
            {!gameState.gender ? (
              <p className="text-sm text-gray-400 italic">
                请先选择对方性别
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableVoices.map((voice) => (
                  <Button
                    key={voice.voiceType}
                    variant={
                      gameState.voiceType === voice.voiceType
                        ? 'default'
                        : 'outline'
                    }
                    className={cn(
                      'justify-start',
                      gameState.voiceType === voice.voiceType &&
                        'bg-pink-500 hover:bg-pink-600'
                    )}
                    onClick={() => setVoiceType(voice.voiceType)}
                  >
                    {voice.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* 开始按钮 */}
          <div className="space-y-2">
            <Button
              onClick={handleStartGame}
              className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              disabled={!gameState.gender || !gameState.scenario || !gameState.voiceType}
            >
              <Heart className="w-5 h-5 mr-2 fill-current" />
              开始游戏
            </Button>
            {showError && (
              <p className="text-sm text-red-500 text-center animate-pulse">
                请先选择所有选项！
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
