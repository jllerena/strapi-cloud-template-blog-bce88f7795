"use client"
import { useEffect, useMemo, useState } from 'react'

export default function Page() {
  const [load, setLoad] = useState('')
  const [speed, setSpeed] = useState('')
  const [temp, setTemp] = useState('')
  const [unitForce, setUnitForce] = useState<'N' | 'lbf'>('N')
  const [unitTemp, setUnitTemp] = useState<'C' | 'F'>('C')
  const [unitSpeed, setUnitSpeed] = useState<'RPM' | 'rad/s'>('RPM')
  const [product, setProduct] = useState<'A' | 'B' | 'C' | ''>('')
  const [grade, setGrade] = useState<'0W-8' | '5W-30' | '10W-40' | ''>('')
  const [mu, setMu] = useState<number | null>(null)
  const [treat, setTreat] = useState<number | null>(null)
  const [calculated, setCalculated] = useState(false)

  const productFactor: Record<string, number> = { A: 0.85, B: 0.75, C: 0.65 }
  const gradeFactor: Record<string, number> = { '0W-8': 0.9, '5W-30': 1.0, '10W-40': 1.1 }

  function toSIForce(v: number) {
    return unitForce === 'N' ? v : v * 4.4482216153
  }
  function fromSIForce(v: number) {
    return unitForce === 'N' ? v : v / 4.4482216153
  }
  function toSISpeed(v: number) {
    return unitSpeed === 'RPM' ? v : (v * 60) / (2 * Math.PI)
  }
  function fromSISpeed(v: number) {
    return unitSpeed === 'RPM' ? v : (v * 2 * Math.PI) / 60
  }
  function toSITemp(v: number) {
    return unitTemp === 'C' ? v : (v - 32) * (5 / 9)
  }
  function fromSITemp(v: number) {
    return unitTemp === 'C' ? v : v * (9 / 5) + 32
  }

  const ranges = {
    force: unitForce === 'N' ? { min: 10, max: 10000 } : { min: 10 / 4.4482216153, max: 10000 / 4.4482216153 },
    speed: unitSpeed === 'RPM' ? { min: 100, max: 10000 } : { min: (100 * 2 * Math.PI) / 60, max: (10000 * 2 * Math.PI) / 60 },
    temp: unitTemp === 'C' ? { min: -40, max: 200 } : { min: (-40 * 9) / 5 + 32, max: (200 * 9) / 5 + 32 },
  }

  const outOfRange = useMemo(() => {
    const L = parseFloat(load)
    const S = parseFloat(speed)
    const T = parseFloat(temp)
    return {
      load: isFinite(L) && (L < ranges.force.min || L > ranges.force.max),
      speed: isFinite(S) && (S < ranges.speed.min || S > ranges.speed.max),
      temp: isFinite(T) && (T < ranges.temp.min || T > ranges.temp.max),
    }
  }, [load, speed, temp, ranges.force.min, ranges.force.max, ranges.speed.min, ranges.speed.max, ranges.temp.min, ranges.temp.max])

  function calc() {
    const Lraw = parseFloat(load)
    const Sraw = parseFloat(speed)
    const Traw = parseFloat(temp)
    if (!isFinite(Lraw) || !isFinite(Sraw) || !isFinite(Traw) || !product || !grade) return
    const L = toSIForce(Lraw)
    const S = toSISpeed(Sraw)
    const T = toSITemp(Traw)
    const baseMu = 0.12 + (L - 1000) * 0.00001 - (S - 1000) * 0.00002 + Math.max(0, T - 60) * 0.0001
    const boundedMu = Math.max(0.05, Math.min(0.25, parseFloat(baseMu.toFixed(3))))
    const baseRate = Math.max(0.1, Math.min(3.0, parseFloat(((L / 1000) * 0.6 + (S / 1000) * 0.3 + Math.max(0, T - 40) * 0.02).toFixed(2))))
    const rateAdj = baseRate * (gradeFactor[grade] || 1) * (productFactor[product] || 1)
    setMu(boundedMu)
    setTreat(parseFloat(rateAdj.toFixed(2)))
    setCalculated(true)
  }

  useEffect(() => {
    if (calculated) calc()
  }, [unitForce, unitSpeed, unitTemp])
  return (
    <section className="section">
      <div className="container">
        <h1>Friction Calculator</h1>
        <p>Enter application parameters to estimate a starting additive treat rate.</p>
        <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Load ({unitForce})
              <input type="number" inputMode="decimal" min={ranges.force.min} max={ranges.force.max} value={load} onChange={(e) => setLoad(e.target.value)} />
            </label>
            <input type="range" min={ranges.force.min} max={ranges.force.max} step={unitForce === 'N' ? 1 : 0.1} value={parseFloat(load) || 0} onChange={(e) => setLoad(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select aria-label="Force unit" value={unitForce} onChange={(e) => {
                const v = parseFloat(load)
                setUnitForce(e.target.value as any)
                if (isFinite(v)) setLoad(String(fromSIForce(toSIForce(v))))
              }}>
                <option value="N">N</option>
                <option value="lbf">lbf</option>
              </select>
              {outOfRange.load && <span style={{ color: 'crimson' }}>Allowed {ranges.force.min.toFixed(0)}–{ranges.force.max.toFixed(0)} {unitForce}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Speed ({unitSpeed})
              <input type="number" inputMode="decimal" min={ranges.speed.min} max={ranges.speed.max} value={speed} onChange={(e) => setSpeed(e.target.value)} />
            </label>
            <input type="range" min={ranges.speed.min} max={ranges.speed.max} step={unitSpeed === 'RPM' ? 10 : 0.5} value={parseFloat(speed) || 0} onChange={(e) => setSpeed(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select aria-label="Speed unit" value={unitSpeed} onChange={(e) => {
                const v = parseFloat(speed)
                setUnitSpeed(e.target.value as any)
                if (isFinite(v)) setSpeed(String(fromSISpeed(toSISpeed(v))))
              }}>
                <option value="RPM">RPM</option>
                <option value="rad/s">rad/s</option>
              </select>
              {outOfRange.speed && <span style={{ color: 'crimson' }}>Allowed {ranges.speed.min.toFixed(0)}–{ranges.speed.max.toFixed(0)} {unitSpeed}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Temperature (°{unitTemp})
              <input type="number" inputMode="decimal" min={ranges.temp.min} max={ranges.temp.max} value={temp} onChange={(e) => setTemp(e.target.value)} />
            </label>
            <input type="range" min={ranges.temp.min} max={ranges.temp.max} step={unitTemp === 'C' ? 1 : 1} value={parseFloat(temp) || 0} onChange={(e) => setTemp(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select aria-label="Temperature unit" value={unitTemp} onChange={(e) => {
                const v = parseFloat(temp)
                setUnitTemp(e.target.value as any)
                if (isFinite(v)) setTemp(String(fromSITemp(toSITemp(v))))
              }}>
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
              {outOfRange.temp && <span style={{ color: 'crimson' }}>Allowed {ranges.temp.min.toFixed(0)}–{ranges.temp.max.toFixed(0)} °{unitTemp}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Additive Product
              <select value={product} onChange={(e) => setProduct(e.target.value as any)}>
                <option value="">Select product</option>
                <option value="A">Friction Modifier A</option>
                <option value="B">Friction Modifier B</option>
                <option value="C">Friction Modifier C</option>
              </select>
            </label>
            <label>Base Oil Grade
              <select value={grade} onChange={(e) => setGrade(e.target.value as any)}>
                <option value="">Select grade</option>
                <option value="0W-8">SAE 0W-8</option>
                <option value="5W-30">SAE 5W-30</option>
                <option value="10W-40">SAE 10W-40</option>
              </select>
            </label>
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={calc} disabled={!load || !speed || !temp || !product || !grade}>Calculate</button>
          </div>
          <div className="card" style={{ background: '#f8fafc' }}>
            <div style={{ marginBottom: 8, color: '#6b7280' }}>Results update automatically after you click Calculate.</div>
            <div>Coefficient of friction (μ): {mu !== null ? mu.toFixed(3) : '-'}</div>
            <div>Recommended treat-rate (wt %): {treat !== null ? treat.toFixed(2) : '-'}</div>
            <div style={{ marginTop: 8, color: '#6b7280' }}>Model assumes steel-on-steel, boundary lubrication; for mixed or EHD regimes contact tech-service@nrtechusa.co.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
