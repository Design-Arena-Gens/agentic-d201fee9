import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'YouTube API credentials not configured' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      message: 'Save the refresh_token to your .env file as YOUTUBE_REFRESH_TOKEN',
    });
  } catch (error: any) {
    console.error('Error in YouTube callback:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code', details: error.message },
      { status: 500 }
    );
  }
}
