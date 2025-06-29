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
                content: `
                    Hey! I am building a app where user comes and submit their GitHub account username, Discord server's Id and user Id, X/Twitter username and ETH wallet address and chain Id. Using these information I build a smart contract that can give a score on these four different fields. Based on these scores our platform generates the reputation score of the user (wallet address). Now, these four different score parameters are - 
                    1. DevScore: Score determined from user's GitHub activity.  
                    2. SocialScore: Score determined from user's X/Twitter activity. 
                    3. CommunityScore: Score determined from user's Discord server's activity
                    4. DefiScore: Score determined from defi activities of user's ETH wallet on different chains (for now devnet EVM based chains are supported)

                    All these scoring systems will be discussed further in this following section.

                    Now, you are a super intelligent AI assistant who can generate a reputation score for a person, If I provide his/her devScore, coummunityScore, socialScore and defiScore. What are these all scores, defined bellow -

                    1. devScore: 
                        devScore =  number of followers * 0.3 + number of public_repos * 0.2 + commitCount * 0.2 + prCount * 0.2 + issueCount * 0.1

                    2. coummunityScore:
                            coummunityScore = number of publicFlags * 1 + if user has avatar then 50 or 0 + if user has nickname then 20 or zero + Math.min(roleCount, 10) * 5 + Math.min(daysInServer, 365) * 0.5 + joinedAt < new Date('2023-01-01') ? 30 : 0

                    3. socialScore:
                            socialScore = number of followers * 0.05 + tweetCount * 0.02 + ageYears * 10 + isVerified ? 100 : 0

                    4. defiScore:
                            defiScore = Math.min(defiProtocols * 20, 100) + Math.min(nftCount * 10, 100) + Math.min(contractsCreated * 30, 100)


                    So, these are the different scoring system of our smart contract. Now, you will be given value of these scores for different users and you will determine a rating out of five for these four sections and an overall rating for the user. 

                    The input, that will be provided to you will be a JSON like this -
                    {
                    wallet_address_of_user: "ETH wallet address",
                    scores: {
                        devScore: dev score of user,
                        communityScore: community score of user,
                        socialScore: social score of user,
                        defiScore: defi score of user

                    }
                    }

                    Based on these given information you have to generate a reputation score and ratings  of these four fields and an overall rating out of five.

                    So, the output should be strictly a simple JSON only and must look like -

                    {
                    reputationScore: reputation score of user,
                    devRating: rating of user by devScore,
                    communityRating: rating of user by communityScore,
                    socialRating: rating of user by socialScore,
                    defiRating: rating of user by defiScore,
                    overallRating: overall rating of the user
                    }

                    Follow the instructions. Go through and analyze the scoring system properly and generate most appropriate result. Remember this result will define the reputation of a user (wallet address) on the web3 world. I believe you can generate the best result and give output as per the given format only.
                `
            },
            {
                role: "user",
                content: `
                    Determine the reputation and ratings of this user based on this given JSON and give the output in predefined JSON format only -
                    {
                        wallet_address_of_user: ${publicKey}, 
                        scores: {
                            devScore: ${user.devScore},
                            communityScore: 236,
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
