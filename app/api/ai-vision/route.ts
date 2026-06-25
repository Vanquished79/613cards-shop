import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API Key is missing' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert File to Base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${image.type};base64,${base64Image}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert trading card appraiser. You extract card details from images. Respond strictly in JSON format matching exactly: { \"cardName\": \"Name of card\", \"cardSeries\": \"Series or Set\", \"condition\": \"Estimated condition\" }."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this trading card." },
            { type: "image_url", image_url: { url: dataUri } }
          ]
        }
      ]
    });

    const content = response.choices[0].message.content;
    const extractedData = content ? JSON.parse(content) : null;

    if (!extractedData || !extractedData.cardName) {
      return NextResponse.json({ error: 'Failed to extract card details' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        cardName: extractedData.cardName,
        cardSeries: extractedData.cardSeries || 'Unknown Series',
        condition: extractedData.condition || 'NM',
        isGraded: false
      }
    });

  } catch (error: any) {
    console.error('OpenAI Vision Error:', error);
    return NextResponse.json({ error: error.message || 'Internal AI Vision error' }, { status: 500 });
  }
}
