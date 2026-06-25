import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'Images are required for grading' }, { status: 400 });
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate random mock results for demonstration
    // In a real app, this would send the image to a Vision AI model
    
    const grades = [8.0, 8.5, 9.0, 9.5, 10.0];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    
    // Centering calculation (e.g. 50/50, 60/40)
    const centeringOffsets = [[50,50], [55,45], [60,40], [51,49], [53,47]];
    const topBottom = centeringOffsets[Math.floor(Math.random() * centeringOffsets.length)];
    const leftRight = centeringOffsets[Math.floor(Math.random() * centeringOffsets.length)];

    return NextResponse.json({
      success: true,
      data: {
        aiGradeEstimate: grade,
        aiCentering: `T/B: ${topBottom[0]}/${topBottom[1]} | L/R: ${leftRight[0]}/${leftRight[1]}`,
        metrics: {
          corners: (grade - Math.random() * 0.5).toFixed(1),
          edges: (grade - Math.random() * 0.5).toFixed(1),
          surface: (grade - Math.random() * 0.5).toFixed(1),
          centering: grade >= 9.5 ? 10 : (grade - Math.random() * 0.5).toFixed(1)
        },
        notes: grade === 10.0 
          ? "Pristine condition. Excellent candidate for grading." 
          : "Minor wear on edges/corners detected.",
        heatmapImageUrl: images[0] // Mocking a heatmap overlay
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal grading error' }, { status: 500 });
  }
}
