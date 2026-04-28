'use client';

import { GameProvider, useGame } from '@/context/GameContext';
import Header from '@/components/Header';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import GameOverScreen from '@/components/GameOverScreen';

function GameContent() {
  const { gameState } = useGame();

  // 根据游戏状态显示不同界面
  if (gameState.gameOver) {
    return <GameOverScreen />;
  }

  if (gameState.step === 0) {
    return <StartScreen />;
  }

  return <GameScreen />;
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <GameProvider>
        <GameContent />
      </GameProvider>
    </div>
  );
}
