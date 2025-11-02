import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Call Google Vertex AI Veo 3.1 API
    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID || 'your-project'}/locations/us-central1/publishers/google/models/veo-3.1:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '9:16', // YouTube Shorts format
            duration: 'short', // Up to 60 seconds
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Veo API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate video with Veo 3.1', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract video data from response
    const videoData = data.predictions?.[0]?.video || data.video;
    const operationId = data.name || data.operationId;

    if (!videoData) {
      // If video is still processing, return operation ID
      return NextResponse.json({
        status: 'processing',
        operationId,
        message: 'Video generation in progress',
      });
    }

    return NextResponse.json({
      videoData,
      operationId,
      status: 'completed',
    });
  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
