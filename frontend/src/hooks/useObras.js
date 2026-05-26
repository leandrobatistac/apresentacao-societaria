import { useState, useEffect } from 'react'
import { parseObrasCSV } from '../utils/parseCSV'

export function useObras() {
  const [obras, setObras]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/obras')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(text => {
        setObras(parseObrasCSV(text))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { obras, loading, error }
}
