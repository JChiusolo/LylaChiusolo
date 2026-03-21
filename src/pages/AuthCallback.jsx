import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    
    if (code) {
      exchangeCodeForToken(code)
    } else {
      navigate('/search')
    }
  }, [searchParams, navigate])

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch('/.netlify/functions/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      
      if (data.access_token) {
        localStorage.setItem('google_access_token', data.access_token)
        navigate('/search')
      } else {
        navigate('/search')
      }
    } catch (error) {
      console.error('Token exchange failed:', error)
      navigate('/search')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Signing in...</p>
      </div>
    </div>
  )
}
