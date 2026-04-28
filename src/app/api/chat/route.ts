import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, Option } from '@/types/game';

// 生成选项
function generateOptions(): Option[] {
  const allOptions: Option[] = [
    // 加分选项
    { id: 'opt-1', content: '真诚道歉，承认自己的错误', score: 15 },
    { id: 'opt-2', content: '提出具体的弥补方案', score: 10 },
    { id: 'opt-3', content: '提起我们共同的美好回忆', score: 8 },
    { id: 'opt-4', content: '保证以后会注意，不再犯同样的错误', score: 12 },
    // 减分选项
    { id: 'opt-5', content: '敷衍地说"我错了还不行吗"', score: -10 },
    { id: 'opt-6', content: '转移话题，说"你怎么又提这个"', score: -15 },
    { id: 'opt-7', content: '找借口说"我最近太忙了"', score: -5 },
    { id: 'opt-8', content: '反问"你至于这么生气吗"', score: -20 },
    // 奇葩搞笑选项
    { id: 'opt-9', content: '掏出手机说"我给你看我淘宝购物车，全是给你买的！"', score: -25 },
    { id: 'opt-10', content: '突然单膝跪地说"请接受我的膝盖！"', score: -20 },
    { id: 'opt-11', content: '假装打电话说"喂，民政局吗？我要预约离婚"然后看对方反应', score: -30 },
    { id: 'opt-12', content: '认真地说"我觉得我们需要冷静一下"然后打开游戏', score: -25 },
  ];

  const shuffled = allOptions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6).map((opt, idx) => ({
    ...opt,
    id: `opt-${Date.now()}-${idx}`,
  }));
}

// 默认响应
function getDefaultResponse(step: number, isGameOver: boolean, won: boolean) {
  if (isGameOver) {
    if (won) {
      return { partnerMessage: '好吧...看你这么有诚意，这次就原谅你了。但下次不许再犯！', options: [] };
    } else {
      return { partnerMessage: '我们还是先分开冷静一下吧...', options: [] };
    }
  }

  const defaultMessages = [
    '你怎么现在才来？你知道我等了多久吗？',
    '你还知道来找我？我以为你把我忘了呢。',
    '哼，你觉得自己做得对吗？',
    '行，那你现在打算怎么办？',
    '我不想听你解释，你每次都这样说。',
    '算了，跟你说也没用，你根本不懂我。',
    '你现在才发现问题？早干嘛去了？',
    '好，那你说说看，你打算怎么补偿我？',
    '你的态度呢？我没看到你的诚意。',
    '（沉默地看着你，等你开口）',
  ];

  return { partnerMessage: defaultMessages[Math.min(step - 1, defaultMessages.length - 1)], options: generateOptions() };
}

export async function POST(request: NextRequest) {
  const body: ChatRequest = await request.json();
  const { step, isGameOver, won } = body;

  console.log('[Chat API] Request:', { step, isGameOver, won });

  const response = getDefaultResponse(step, isGameOver, won);
  return NextResponse.json(response);
}
