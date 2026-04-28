import { NextRequest, NextResponse } from 'next/server';

// 暂时禁用语音功能
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'TTS feature is temporarily disabled', audioUri: null },
    { status: 501 }
  );
}
