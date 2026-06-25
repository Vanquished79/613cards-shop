import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert File to Base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    const prompt = "You are an expert trading card appraiser. You extract card details from images. Respond strictly in JSON format matching exactly: { \"cardName\": \"Name of card\", \"cardSeries\": \"Series or Set\", \"condition\": \"Estimated condition\" }. Do not wrap the JSON in markdown code blocks, just return the raw JSON object.";
    
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: image.type || "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Attempt to parse the JSON response. Sometimes models wrap it in ```json blocks
    let content = responseText.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let extractedData = null;
    try {
      extractedData = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', content);
      throw new Error('AI returned malformed JSON');
    }

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
    console.error('Gemini Vision Error:', error);
    
    // Attempt to list available models to help debug the 404 error
    let availableModels = '';
    try {
      if (process.env.GEMINI_API_KEY) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          const models = data.models.map((m: any) => m.name.replace('models/', ''));
          availableModels = ` Available models for your key: ${models.join(', ')}`;
        }
      }
    } catch (e) {
      console.error('Failed to fetch model list:', e);
    }

    return NextResponse.json({ error: (error.message || 'Internal AI Vision error') + availableModels }, { status: 500 });
  }
}
