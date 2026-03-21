const { google } = require('googleapis')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { title, summary, citations, disclaimer, supportingSourceCount, accessToken } = JSON.parse(event.body)

    if (!accessToken) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No access token' }) }
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const slides = google.slides({ version: 'v1', auth })

    // Create presentation
    const presentation = await slides.presentations.create({ 
      requestBody: { title } 
    })
    const presentationId = presentation.data.presentationId

    // Get the first slide
    const slideData = await slides.presentations.get({ presentationId })
    const firstSlide = slideData.data.slides[0]
    const pageId = firstSlide.objectId

    // Find or create a text box on first slide
    let textBoxId = null
    if (firstSlide.pageElements && firstSlide.pageElements.length > 0) {
      textBoxId = firstSlide.pageElements[0].objectId
    }

    const requests = []

    // Only add text if we have a text box
    if (textBoxId) {
      requests.push({
        insertText: {
          objectId: textBoxId,
          text: title,
          insertionIndex: 0,
        },
      })
    }

    if (requests.length > 0) {
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      })
    }

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        presentationId, 
        presentationUrl,
        message: 'Presentation created successfully',
      }),
    }
  } catch (error) {
    console.error('Error:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
