import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { videoData, title, description, tags } = await request.json();

    if (!videoData) {
      return NextResponse.json(
        { error: 'Video data is required' },
        { status: 400 }
      );
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        { error: 'YouTube API credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Convert base64 video data to buffer if needed
    let videoBuffer: Buffer;
    if (typeof videoData === 'string') {
      // If it's a base64 string
      videoBuffer = Buffer.from(videoData, 'base64');
    } else if (videoData.data) {
      // If it's an object with data property
      videoBuffer = Buffer.from(videoData.data, 'base64');
    } else {
      videoBuffer = Buffer.from(videoData);
    }

    // Upload video to YouTube
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title || 'Adorable Dog Video',
          description: description || 'AI-generated dog video created with Veo 3.1 #Shorts',
          tags: tags || ['dog', 'cute', 'pets', 'animals', 'shorts'],
          categoryId: '15', // Pets & Animals category
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: videoBuffer,
      },
    } as any);

    const videoId = uploadResponse.data.id;
    const videoUrl = `https://www.youtube.com/shorts/${videoId}`;

    return NextResponse.json({
      videoId,
      videoUrl,
      status: 'uploaded',
    });
  } catch (error: any) {
    console.error('Error uploading to YouTube:', error);
    return NextResponse.json(
      { error: 'Failed to upload to YouTube', details: error.message },
      { status: 500 }
    );
  }
}
