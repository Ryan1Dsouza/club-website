import { useCallback, useEffect, useState } from 'react'
import { describeError, listMembers } from '../lib/members'
import type { TeamMember } from '../lib/database.types'

export function useMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const request = new AbortController()
    void listMembers(request.signal)
      .then((data) => {
        if (!request.signal.aborted) setMembers(data)
      })
      .catch((e) => {
        if (!request.signal.aborted) setError(describeError(e))
      })
      .finally(() => {
        if (!request.signal.aborted) setLoading(false)
      })
    return () => request.abort()
  }, [revision])
  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    setRevision((value) => value + 1)
  }, [])
  return { members, loading, error, refresh }
}
