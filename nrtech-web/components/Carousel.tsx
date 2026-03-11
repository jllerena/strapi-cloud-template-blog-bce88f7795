"use client"
import { useEffect, useState } from 'react'

type Item = { quote: string; attribution?: string }

export default function Carousel({ items, intervalMs = 4500 }: { items: Item[]; intervalMs?: number }) {
  const [idx, setIdx] = useState(0)
  if (!items?.length) return null
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length)
  const next = () => setIdx((i) => (i + 1) % items.length)
  const it = items[idx]
  useEffect(() => {
    const t = setInterval(next, intervalMs)
    return () => clearInterval(t)
  }, [idx, intervalMs])
  return (
    <div className="carousel" style={{ marginTop: 16 }}>
      <div className="slides">
        <div className="slide">“{it.quote}” {it.attribution ? `— ${it.attribution}` : ''}</div>
      </div>
      <div className="carousel-controls">
        <button className="carousel-btn" onClick={prev}>Prev</button>
        <button className="carousel-btn" onClick={next}>Next</button>
      </div>
    </div>
  )
}
