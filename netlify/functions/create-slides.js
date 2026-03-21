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

    // Get first slide
    const slideData = await slides.presentations.get({ presentationId })
    const firstSlide = slideData.data.slides[0]
    let textBoxId = firstSlide.pageElements?.[0]?.objectId

    // Add title to first slide
    if (textBoxId) {
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: { 
          requests: [{
            insertText: {
              objectId: textBoxId,
              text: title,
              insertionIndex: 0,
            },
          }],
        },
      })
    }

    // Create summary slide with text box
    const summaryRequests = [
      {
        createSlide: {
          objectId: 'summary_slide',
          slideLayoutReference: { predefinedLayout: 'BLANK' },
        },
      },
      {
        createShape: {
          objectId: 'summary_text_box',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'summary_slide',
            size: {
              width: { magnitude: 9000000, unit: 'EMU' },
              height: { magnitude: 7000000, unit: 'EMU' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 500000,
              translateY: 500000,
              unit: 'EMU',
            },
          },
        },
      },
    ]

    // Add citations slide with text box if citations exist
    if (citations && citations.length > 0) {
      summaryRequests.push({
        createSlide: {
          objectId: 'citations_slide',
          slideLayoutReference: { predefinedLayout: 'BLANK' },
        },
      })
      summaryRequests.push({
        createShape: {
          objectId: 'citations_text_box',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'citations_slide',
            size: {
              width: { magnitude: 9000000, unit: 'EMU' },
              height: { magnitude: 7000000, unit: 'EMU' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 500000,
              translateY: 500000,
              unit: 'EMU',
            },
          },
        },
      })
    }

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests: summaryRequests },
    })

    // Now add content to text boxes
    const contentRequests = []

    let summaryContent = 'Evidence Summary\n\n' + summary

    if (supportingSourceCount > 0) {
      summaryContent += `\n\nSupporting Sources: ${supportingSourceCount}`
    }

    if (disclaimer) {
      summaryContent += `\n\n⚠️ ${disclaimer}`
    }

    contentRequests.push({
      insertText: {
        objectId: 'summary_text_box',
        text: summaryContent,
        insertionIndex: 0,
      },
    })

    if (citations && citations.length > 0) {
      let citationContent = 'Cited References\n\n'
      citations.forEach((c, idx) => {
        citationContent += `[${idx + 1}] ${c.title}\n`
        citationContent += `Authors: ${c.authors}\n`
        citationContent += `Type: ${c.type}\n\n`
      })

      contentRequests.push({
        insertText: {
          objectId: 'citations_text_box',
          text: citationContent,
          insertionIndex: 0,
        },
      })
    }

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests: contentRequests },
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
    console.error('Error:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
