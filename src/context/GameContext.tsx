'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  GameState,
  Gender,
  Scenario,
  VoiceType,
  Option,
  Message,
  INITIAL_GAME_STATE,
  INITIAL_AFFECTION,
  MAX_AFFECTION,
  MIN_AFFECTION,
  WIN_AFFECTION,
  MAX_ROUNDS,
} from '@/types/game';

interface GameContextType {
  gameState: GameState;
  setGender: (gender: Gender) => void;
  setScenario: (scenario: Scenario) => void;
  setVoiceType: (voiceType: VoiceType) => void;
  startGame: () => void;
  selectOption: (option: Option) => void;
  resetGame: () => void;
  addPartnerMessage: (content: string, options: Option[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const setGender = useCallback((gender: Gender) => {
    setGameState((prev) => ({ ...prev, gender }));
  }, []);

  const setScenario = useCallback((scenario: Scenario) => {
    setGameState((prev) => ({ ...prev, scenario }));
  }, []);

  const setVoiceType = useCallback((voiceType: VoiceType) => {
    setGameState((prev) => ({ ...prev, voiceType }));
  }, []);

  // ⚠️ 关键实现要点：使用函数式更新，避免闭包陷阱
  const startGame = useCallback(() => {
    setGameState((prev) => {
      const gender = prev.gender;
      const scenario = prev.scenario;
      const voiceType = prev.voiceType;

      if (!gender || !scenario || !voiceType) {
        console.error('Missing game config:', { gender, scenario, voiceType });
        return prev;
      }

      return {
        ...prev,
        step: 1,
        affection: INITIAL_AFFECTION,
        messages: [],
        currentOptions: [],
        gameOver: false,
        won: false,
      };
    });
  }, []);

  // ⚠️ 关键实现要点：使用函数式更新
  const selectOption = useCallback((option: Option) => {
    setGameState((prev) => {
      const newAffection = Math.max(
        MIN_AFFECTION,
        Math.min(MAX_AFFECTION, prev.affection + option.score)
      );

      // 添加用户消息
      const newMessages: Message[] = [
        ...prev.messages,
        { role: 'user', content: option.content },
      ];

      // 检查游戏是否结束
      let gameOver = false;
      let won = false;

      if (newAffection >= WIN_AFFECTION) {
        gameOver = true;
        won = true;
      } else if (newAffection < MIN_AFFECTION) {
        gameOver = true;
        won = false;
      } else if (prev.step >= MAX_ROUNDS) {
        gameOver = true;
        won = false;
      }

      return {
        ...prev,
        affection: newAffection,
        messages: newMessages,
        gameOver,
        won,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

  // 添加对方的回复和选项
  const addPartnerMessage = useCallback(
    (content: string, options: Option[]) => {
      setGameState((prev) => {
        const newMessages: Message[] = [
          ...prev.messages,
          { role: 'partner', content },
        ];

        // 检查是否超过最大轮数
        let gameOver = prev.gameOver;
        let won = prev.won;
        let newStep = prev.step;

        if (!gameOver && prev.step >= MAX_ROUNDS && prev.affection < WIN_AFFECTION) {
          gameOver = true;
          won = false;
        } else if (!gameOver) {
          newStep = prev.step + 1;
        }

        return {
          ...prev,
          messages: newMessages,
          currentOptions: options,
          step: newStep,
          gameOver,
          won,
        };
      });
    },
    []
  );

  const value: GameContextType = {
    gameState,
    setGender,
    setScenario,
    setVoiceType,
    startGame,
    selectOption,
    resetGame,
    addPartnerMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
