const { google } = require('googleapis')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { title, summary, citations, disclaimer, supportingSourceCount, accessToken } = JSON.parse(event.body)

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No access token provided' }),
      }
    }

    // Create OAuth2 client with just the access token
    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: accessToken,
      token_type: 'Bearer',
    })

    const slides = google.slides({ version: 'v1', auth })

    // Create presentation
    const presentation = await slides.presentations.create({
      requestBody: {
        title: title,
      },
    })

    const presentationId = presentation.data.presentationId
    const pageId = presentation.data.slides[0].objectId

    // Prepare requests for content
    const requests = [
      {
        insertText: {
          objectId: presentation.data.slides[0].pageElements[0].objectId,
          text: title,
          insertionIndex: 0,
        },
      },
      {
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 0.5, unit: 'INCHES' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: { magnitude: 0.5, unit: 'INCHES' },
              translateY: { magnitude: 1.5, unit: 'INCHES' },
              unit: 'INCHES',
            },
          },
          text: 'Evidence Summary',
        },
      },
      {
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 2.5, unit: 'INCHES' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: { magnitude: 0.5, unit: 'INCHES' },
              translateY: { magnitude: 2.1, unit: 'INCHES' },
              unit: 'INCHES',
            },
          },
          text: summary,
        },
      },
    ]

    if (supportingSourceCount > 0) {
      requests.push({
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 0.3, unit: 'INCHES' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: { magnitude: 0.5, unit: 'INCHES' },
              translateY: { magnitude: 4.7, unit: 'INCHES' },
              unit: 'INCHES',
            },
          },
          text: `Supporting Sources: ${supportingSourceCount}`,
        },
      })
    }

    if (citations && citations.length > 0) {
      requests.push({
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 0.5, unit: 'INCHES' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: { magnitude: 0.5, unit: 'INCHES' },
              translateY: { magnitude: 5.5, unit: 'INCHES' },
              unit: 'INCHES',
            },
          },
          text: 'Cited References',
        },
      })

      const citationsPerSlide = 3
      for (let i = 0; i < citations.length; i += citationsPerSlide) {
        const batch = citations.slice(i, i + citationsPerSlide)
        const text = batch.map((c, idx) => `[${i + idx + 1}] ${c.title}\nAuthors: ${c.authors}\nType: ${c.type}`).join('\n\n---\n\n')

        requests.push({
          createTextBox: {
            elementProperties: {
              pageObjectId: pageId,
              size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 6, unit: 'INCHES' } },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: { magnitude: 0.5, unit: 'INCHES' },
                translateY: { magnitude: 0.5, unit: 'INCHES' },
                unit: 'INCHES',
              },
            },
            text: text,
          },
        })
      }
    }

    if (disclaimer) {
      requests.push({
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: { width: { magnitude: 9, unit: 'INCHES' }, height: { magnitude: 1, unit: 'INCHES' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: { magnitude: 0.5, unit: 'INCHES' },
              translateY: { magnitude: 7, unit: 'INCHES' },
              unit: 'INCHES',
            },
          },
          text: `⚠️ Disclaimer: ${disclaimer}`,
        },
      })
    }

    // Add all content
    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: { requests },
    })

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`

    return {
      statusCode: 200,
      body: JSON.stringify({
        presentationId,
        presentationUrl,
      }),
    }
  } catch (error) {
    console.error('Create slides error:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}
