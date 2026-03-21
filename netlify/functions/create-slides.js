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

    const auth = new google.auth.OAuth2(
      '45893805451-gpspi2ei5frk4fcanur2pfboqkur52j3.apps.googleusercontent.com'
    )

    auth.setCredentials({
      access_token: accessToken,
    })

    const slides = google.slides({ version: 'v1', auth })

    const createResponse = await slides.presentations.create({
      requestBody: {
        title: title,
      },
    })

    const presentationId = createResponse.data.presentationId

    const slidesResponse = await slides.presentations.get({
      presentationId: presentationId,
    })

    const pageId = slidesResponse.data.slides?.[0]?.objectId || 'page1'

    const requests = []

    requests.push({
      insertText: {
        objectId: slidesResponse.data.slides?.[0]?.pageElements?.[0]?.objectId || 'title',
        text: title,
        insertionIndex: 0,
      },
    })

    requests.push(
      {
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 9, unit: 'INCHES' },
              height: { magnitude: 0.5, unit: 'INCHES' },
            },
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
            size: {
              width: { magnitude: 9, unit: 'INCHES' },
              height: { magnitude: 2.5, unit: 'INCHES' },
            },
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
      }
    )

    if (supportingSourceCount > 0) {
      requests.push({
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 9, unit: 'INCHES' },
              height: { magnitude: 0.3, unit: 'INCHES' },
            },
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
            size: {
              width: { magnitude: 9, unit: 'INCHES' },
              height: { magnitude: 0.5, unit: 'INCHES' },
            },
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
        const citationBatch = citations.slice(i, i + citationsPerSlide)
        const citationText = citationBatch
          .map((citation, idx) => {
            const globalIndex = i + idx + 1
            return `[${globalIndex}] ${citation.title}\nAuthors: ${citation.authors}\nType: ${citation.type}\nLink: ${citation.url}`
          })
          .join('\n\n---\n\n')

        requests.push({
          createTextBox: {
            elementProperties: {
              pageObjectId: pageId,
              size: {
                width: { magnitude: 9, unit: 'INCHES' },
                height: { magnitude: 6, unit: 'INCHES' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: { magnitude: 0.5, unit: 'INCHES' },
                translateY: { magnitude: 0.5, unit: 'INCHES' },
                unit: 'INCHES',
              },
            },
            text: citationText,
          },
        })
      }
    }

    if (disclaimer) {
      requests.push({
        createTextBox: {
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 9, unit: 'INCHES' },
              height: { magnitude: 1, unit: 'INCHES' },
            },
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

    if (requests.length > 0) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: requests,
        },
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
    console.error('Error creating Google Slides presentation:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create presentation',
        message: error.message || 'Unknown error',
      }),
    }
  }
}
```

---

## **STEP 3: Update .env.local (Local Development)**

**File Path:** `.env.local`
```
VITE_GOOGLE_CLIENT_ID=45893805451-5jj3mimasahbc9v1baegis10e19db2ps.apps.googleusercontent.com
