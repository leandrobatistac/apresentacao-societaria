import { useState, useEffect } from 'react'
import { parseObra1000CSV } from '../utils/parseObra1000CSV'

export function useObra1000() {
  const [groups,  setGroups]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/obra1000')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(text => {
        setGroups(parseObra1000CSV(text))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { groups, loading, error }
}
