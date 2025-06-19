import { NextRequest, NextResponse } from 'next/server';
import { explainQuestionWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { extractedText, studentAnswer, correctAnswer, subject } = body;

        if (!extractedText || !studentAnswer || !correctAnswer) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await explainQuestionWithAI(extractedText, studentAnswer, correctAnswer, subject);

        if (result.success) {
            return NextResponse.json({ success: true, explanation: result.explanation });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}