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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert File to Base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    const prompt = `You are a highly precise trading card expert and OCR system. Examine the image of the trading card very carefully.
1. Identify the EXACT Player/Character Name or Card Name.
2. Identify the Set, Series, Year, and Brand (e.g., '1999 Pokemon Base Set', '2023 Panini Prizm').
3. Estimate the physical condition based strictly on visible wear (e.g., 'NM', 'LP', 'MP', 'HP').
4. Determine if the card is autographed (look for ink signatures).
5. Determine if the card is a numbered parallel (look for stamped serial numbers like '10/99' or '1/1').
Do not guess or hallucinate. Use ONLY the text and symbols visibly printed on the card.
Respond strictly in JSON format matching exactly:
{
  "cardName": "Exact Name",
  "cardSeries": "Year Brand Set",
  "condition": "Estimated condition",
  "isAutographed": true or false,
  "serialNumber": "10/99" or null
}
Do not wrap the JSON in markdown code blocks, just return the raw JSON object.`;
    
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
        isAutographed: extractedData.isAutographed || false,
        isNumbered: !!extractedData.serialNumber,
        serialNumber: extractedData.serialNumber || null,
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
          availableModels = ` Available models: ${models.join(', ')}`;
        } else {
          const errText = await res.text();
          availableModels = ` (Failed to list models: ${res.status} ${errText})`;
        }
      }
    } catch (e: any) {
      availableModels = ` (Fetch exception: ${e.message})`;
    }

    return NextResponse.json({ error: (error.message || 'Internal AI Vision error') + availableModels }, { status: 500 });
  }
}
