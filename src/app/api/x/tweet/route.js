export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 
      'Access-Control-Allow-Headers': '*'
    }
  });
}

export async function POST(request) {
  try {
    const postData = await request.json();

    if (!postData) {
      return Response.json(
        { error: 'missing parameters' },
        { status: 400 }
      );
    }

    const oauthHeader = request.headers.get('authorization');

    if (!oauthHeader) {
      return Response.json(
        { error: 'missing parameters' },
        { status: 400 }
      );
    }

    const apiUrl = 'https://api.twitter.com/2/tweets';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': oauthHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Twitter API Error:', error);
    return Response.json(
      { error: 'Twitter API request failed' },
      { status: 500 }
    );
  }
}
