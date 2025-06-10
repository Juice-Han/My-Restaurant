import { useState, useEffect } from 'react'

export const useGeoLocation = (options = {}) => {
  const [location, setLocation] = useState()
  const [error, setError] = useState('')

  const handleSuccess = (pos) => {
    const { latitude, longitude } = pos.coords

    setLocation({
      latitude,
      longitude,
    })
  }

  const handleError = (err) => {
    console.log(err)
    let message = ""
    switch (err.code){
      case 1:
        message = "Permission denied. Please allow location access."
        break
      case 2:
        message = "Position unavailable. Please check your device's location settings."
        break
      case 3:
        message = "Timeout. The request took too long to respond."
        break
      default:
        message = "An unknown error occurred."
    }
    setError(message)
  }

  useEffect(() => {
    const { geolocation } = navigator

    if (!geolocation) {
      setError('Geolocation is not supported.')
      return
    }

    geolocation.getCurrentPosition(handleSuccess, handleError, options)
  }, [options])

  return [location, error]
}