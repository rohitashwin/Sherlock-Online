import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  var url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  url = decodeURIComponent(url);
  console.log(`Fetching URL: ${url}`);

  try {
    const response = await axios.get(url, {
      validateStatus: () => true, // This will resolve the promise for any status code
    });

    return NextResponse.json({
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching the URL' }, { status: 500 });
  }
}