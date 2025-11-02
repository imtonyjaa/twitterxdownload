export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const command = searchParams.get('command');
    const mediaId = searchParams.get('media_id');

    if (command !== 'STATUS' || !mediaId) {
      return Response.json(
        { error: '缺少STATUS命令所需参数' },
        { status: 400 }
      );
    }

    const oauthHeader = request.headers.get('authorization');
    if (!oauthHeader) {
      return Response.json(
        { error: '缺少认证信息' },
        { status: 400 }
      );
    }

    const apiUrl = `https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': oauthHeader
      }
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

export async function POST(request) {
  try {
    const oauthHeader = request.headers.get('authorization');
    if (!oauthHeader) {
      return Response.json(
        { error: 'lost authorization info' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const command = formData.get('command');

    const apiUrl = 'https://upload.twitter.com/1.1/media/upload.json';

    let response;

    if (!command && formData.get('media')) {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': oauthHeader
        },
        body: formData
      });
    } else if (command) {
      let requestBody;

      switch (command) {
        case 'INIT':
          if (!formData.get('total_bytes') || !formData.get('media_type')) {
            return Response.json(
              { error: 'missing parameters' },
              { status: 400 }
            );
          }

          requestBody = formData;
          console.log('INIT Request - FormData:', Array.from(formData.entries()));
          break;

        case 'APPEND':
          if (!formData.get('media_id') || !formData.get('segment_index') || !formData.get('media')) {
            return Response.json(
              { error: 'missing parameters' },
              { status: 400 }
            );
          }

          const appendFormData = new FormData();
          appendFormData.append('command', 'APPEND');
          appendFormData.append('media_id', formData.get('media_id'));
          appendFormData.append('segment_index', formData.get('segment_index'));
          appendFormData.append('media', formData.get('media'));

          requestBody = appendFormData;
          console.log('APPEND Request - FormData:', Array.from(appendFormData.entries()));
          break;

        case 'FINALIZE':
          if (!formData.get('media_id')) {
            return Response.json(
              { error: 'missing parameters' },
              { status: 400 }
            );
          }

          requestBody = formData;
          console.log('FINALIZE Request - FormData:', Array.from(formData.entries()));
          break;

        default:
          return Response.json(
            { error: 'unknow cmd: ' + command },
            { status: 400 }
          );
      }

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': oauthHeader
        },
        body: requestBody
      });
    } else {
      return Response.json(
        { error: 'missing parameters' },
        { status: 400 }
      );
    }

    const responseText = await response.text();
    
    if (!responseText.trim()) {
      return new Response(null, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const data = JSON.parse(responseText);
    return Response.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Twitter API Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
