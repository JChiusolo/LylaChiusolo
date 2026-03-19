export const handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  }
}
