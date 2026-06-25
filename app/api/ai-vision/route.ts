import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Simulate AI Vision processing latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI data extraction (In reality, this sends the image to OpenAI GPT-4o Vision)
    // We'll generate a random high-value card for the demo
    const mockCards = [
      { name: "1999 Base Set Charizard Holographic", series: "Pokemon Base Set" },
      { name: "2002 Blue Eyes White Dragon 1st Edition", series: "Yu-Gi-Oh LOB" },
      { name: "LeBron James Topps Chrome Rookie", series: "2003 Topps Chrome" },
      { name: "Michael Jordan Fleer Rookie", series: "1986 Fleer" },
      { name: "1993 Magic The Gathering Black Lotus", series: "MTG Alpha" }
    ];
    
    const extractedCard = mockCards[Math.floor(Math.random() * mockCards.length)];

    return NextResponse.json({
      success: true,
      data: {
        cardName: extractedCard.name,
        cardSeries: extractedCard.series,
        condition: 'NM',
        isGraded: false
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal AI Vision error' }, { status: 500 });
  }
}
