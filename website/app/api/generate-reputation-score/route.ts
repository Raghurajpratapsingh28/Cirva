import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import OpenAI from "openai";
// import * as dotenv from "dote

const prisma = new PrismaClient();

const openai = new OpenAI({
  baseURL: "https://api.inference.net/v1",
  apiKey: process.env.DEEP_SEEK_API_KEY!,
});

// POST endpoint to update dev score for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey } = body;

    if (!publicKey) {
      return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { publicKey} });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
  
    const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1/fp-8",
        messages: [
            {
                role: "system",
                content: process.env.SYSTEM_PROMPT_FOR_AI_AGENT!
            },
            {
                role: "user",
                content: `
                    Determine the reputation and ratings of this user based on this given JSON and give the output in predefined JSON format only -
                    {
                        wallet_address_of_user: ${publicKey}, 
                        scores: {
                            devScore: ${user.devScore},
                            communityScore: ${user.communityScore},
                            socialScore: ${user.socialScore},
                            defiScore: 23
                        }
                    }
                `
            }
        ],
        stream: true,
    });
    
    let result = '';
    for await (const chunk of completion) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) result += content;
    }

    // Extract JSON from the result string using regex
    let parsedResult;
    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            parsedResult = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found in result");
        }
    } catch {
        parsedResult = result; // fallback to raw string if not valid JSON
    }

    console.log("parsedResult: ", parsedResult);

    // Need to store data on chain here

    // Update user
    const updatedUser = await prisma.user.update({
        where: { publicKey },
        data: {
            reputationScore: parsedResult.reputationScore,
            devRating: parsedResult.devRating,
            communityRating: parsedResult.communityRating,
            socialRating: parsedResult.socialRating,
            defiRating: parsedResult.defiRating,
            overallRating: parsedResult.overallRating
        }
    });

    return NextResponse.json({
      success: true,
      message: 'reputation updated successfully',
      result: parsedResult,
      updatedUser: updatedUser
    });
  } catch (error) {
    console.error('reputation update error:', error);
    
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
