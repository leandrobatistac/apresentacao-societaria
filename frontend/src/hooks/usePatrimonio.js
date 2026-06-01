import { useState, useEffect } from 'react'
import { parsePatrimonioCSV } from '../utils/parsePatrimonio'

export function usePatrimonio() {
  const [patrimonio, setPatrimonio] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/patrimonio')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(text => {
        setPatrimonio(parsePatrimonioCSV(text))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { patrimonio, loading, error }
}
