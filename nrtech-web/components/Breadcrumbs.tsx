import Link from 'next/link'

export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ padding: '8px 0' }}>
      <div className="container" style={{ color: '#6b7280', fontSize: 14 }}>
        {items.map((it, i) => (
          <span key={i}>
            {it.href ? <Link href={it.href}>{it.name}</Link> : <span>{it.name}</span>}
            {i < items.length - 1 ? ' / ' : ''}
          </span>
        ))}
      </div>
    </nav>
  )
}

