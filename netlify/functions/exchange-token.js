exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { code } = JSON.parse(event.body)

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No authorization code provided' }),
      }
    }

    const clientId = '45893805451-5jj3mimasahbc9v1baegis10e19db2ps.apps.googleusercontent.com'
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = 'https://lyla-chiusolo-medinfo.netlify.app/auth/callback'

    if (!clientSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GOOGLE_CLIENT_SECRET not configured' }),
      }
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    })

    const data = await response.json()

    if (data.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: data.error,
          error_description: data.error_description,
        }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in,
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Token exchange failed',
        message: error.message,
      }),
    }
  }
}
