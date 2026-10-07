import { useState } from 'react'
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'N'
  )
}
function safePhotoUrl(value: string | null) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'blob:'].includes(url.protocol) ? value : undefined
  } catch {
    return undefined
  }
}
export function Avatar({
  name,
  url,
  large = false,
}: {
  name: string
  url?: string | null
  large?: boolean
}) {
  const [failedUrl, setFailedUrl] = useState<string>()
  const source = safePhotoUrl(url ?? null)
  return (
    <span className={`avatar${large ? ' avatar-large' : ''}`}>
      {source && failedUrl !== source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(source)}
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
