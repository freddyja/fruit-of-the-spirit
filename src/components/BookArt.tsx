const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function ArtPaths({ bookId }: { bookId: string }) {
  if (bookId === 'gal' || bookId === 'jhn') {
    return (
      <>
        <path d="M12 19V8" {...stroke} />
        <path d="M12 12c-3.2-1-5-3.2-5.4-6 2.6.4 4.4 2.2 5.4 6z" {...stroke} />
        <path d="M12 10.5c2.8-1.4 5.2-1.2 6.2-4.8-2.2 1.2-4.2 2.6-6.2 4.8z" {...stroke} />
      </>
    )
  }
  if (bookId === '1co' || bookId === '1jn') {
    return <path d="M12 18s-6-3.7-6-8a3.4 3.4 0 0 1 6-1.6A3.4 3.4 0 0 1 18 10c0 4.3-6 8-6 8z" {...stroke} />
  }
  if (bookId === 'php' || bookId === 'rom') {
    return (
      <>
        <circle cx="12" cy="12" r="3" {...stroke} />
        <path d="M12 5.5v1.6M12 16.9v1.6M5.5 12h1.6M16.9 12h1.6" {...stroke} />
      </>
    )
  }
  if (bookId === 'eph' || bookId === 'col') {
    return (
      <>
        <path d="M7 16.5 12 6.5l5 10" {...stroke} />
        <path d="M8.6 13.2h6.8" {...stroke} />
      </>
    )
  }
  if (bookId === 'mat' || bookId === 'tit') {
    return (
      <>
        <path d="M7 7.5h7.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H9.2v5H7V7.5z" {...stroke} />
        <path d="M14.2 11.5H17" {...stroke} />
      </>
    )
  }
  if (bookId === 'jas' || bookId === '1pe' || bookId === '2pe') {
    return <path d="M6 16.5c2.2-4 4.2-6 6-9 1.8 3 3.8 5 6 9" {...stroke} />
  }
  return (
    <>
      <path d="M8 7.5h8v9H8z" {...stroke} />
      <path d="M10 10.2h4M10 12.6h4" {...stroke} />
    </>
  )
}

export function BookArt({ bookId }: { bookId: string }) {
  return (
    <svg className="book-art" viewBox="0 0 24 24" aria-hidden="true">
      <ArtPaths bookId={bookId} />
    </svg>
  )
}
