import { useState } from 'react';

export default function MemberPhoto({
  src,
  name,
  sizes = '(max-width: 767px) 100vw, 400px',
  priority = false,
}: {
  src?: string;
  name: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const showImage = Boolean(src && src !== failedSrc);
  const initials = name
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {showImage ? (
        <img
          src={src}
          sizes={sizes}
          alt={`Portrait of ${name}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className="member-photo"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="member-photo-initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </>
  );
}
