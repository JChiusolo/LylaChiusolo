import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      
      if (accessToken) {
        localStorage.setItem('google_access_token', accessToken)
        setTimeout(() => {
          navigate('/search')
        }, 100)
      } else {
        navigate('/search')
      }
    } else {
      navigate('/search')
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Signing in...</p>
      </div>
    </div>
  )
}
