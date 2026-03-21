exports.handler = async (event) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        test: 'exchange-token function is working',
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}
