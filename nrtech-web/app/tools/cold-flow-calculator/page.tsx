"use client"
import { useEffect, useMemo, useState } from 'react'

export default function Page() {
  const [blendPct, setBlendPct] = useState('20')
  const [baselineCfpp, setBaselineCfpp] = useState('0')
  const [targetImprovement, setTargetImprovement] = useState('5')
  const [product, setProduct] = useState<'CFI-X' | 'CFI-Y' | 'CFI-Z' | ''>('')
  const [feedstock, setFeedstock] = useState<'soy' | 'rapeseed' | 'uco' | 'tallow' | ''>('')
  const [unitTemp, setUnitTemp] = useState<'C' | 'F'>('C')
  const [unitDose, setUnitDose] = useState<'ppm' | 'wt%'>('ppm')
  const [dosePpm, setDosePpm] = useState<number | null>(null)
  const [predCfppC, setPredCfppC] = useState<number | null>(null)
  const [calculated, setCalculated] = useState(false)

  // product + feedstock → dosage factor (lower is more efficient)
  const factor: Record<string, Record<string, number>> = {
    'CFI-X': { soy: 1.0, rapeseed: 0.95, uco: 1.1, tallow: 1.2 },
    'CFI-Y': { soy: 0.9, rapeseed: 0.85, uco: 1.0, tallow: 1.1 },
    'CFI-Z': { soy: 0.8, rapeseed: 0.78, uco: 0.95, tallow: 1.0 },
  }

  function toC(v: number) {
    return unitTemp === 'C' ? v : (v - 32) * (5 / 9)
  }
  function fromC(v: number) {
    return unitTemp === 'C' ? v : v * (9 / 5) + 32
  }
  function toWtPercent(ppm: number) {
    return ppm / 10000
  }
  function fromWtPercent(wt: number) {
    return wt * 10000
  }

  const ranges = {
    blend: { min: 0, max: 100 },
    dose: { min: 0, max: 5000 },
    temp: unitTemp === 'C' ? { min: -40, max: 20 } : { min: (-40 * 9) / 5 + 32, max: (20 * 9) / 5 + 32 },
  }

  const outOfRange = useMemo(() => {
    const b = parseFloat(blendPct)
    const t = parseFloat(baselineCfpp)
    const dose = dosePpm ?? NaN
    return {
      blend: isFinite(b) && (b < ranges.blend.min || b > ranges.blend.max),
      temp: isFinite(t) && (t < ranges.temp.min || t > ranges.temp.max),
      dose: isFinite(dose) && (dose < ranges.dose.min || dose > ranges.dose.max),
    }
  }, [blendPct, baselineCfpp, dosePpm, ranges.blend.min, ranges.blend.max, ranges.temp.min, ranges.temp.max, ranges.dose.min, ranges.dose.max])

  function calc() {
    const blend = parseFloat(blendPct)
    const baseC = toC(parseFloat(baselineCfpp))
    const targetImp = Math.max(0, parseFloat(targetImprovement) || 0)
    if (!isFinite(blend) || !isFinite(baseC) || !product || !feedstock) return
    const eff = factor[product]?.[feedstock] ?? 1.0
    const baseDose = 500 + blend * 20 + targetImp * 40 // ppm baseline relationship
    const dose = Math.round(baseDose * eff)
    const predicted = baseC - targetImp
    setDosePpm(dose)
    setPredCfppC(predicted)
    setCalculated(true)
  }

  useEffect(() => {
    if (calculated) calc()
  }, [unitTemp, unitDose])
  return (
    <section className="section">
      <div className="container">
        <h1>Cold Flow Dosage Calculator</h1>
        <p>Estimate improver dosage for biodiesel blends.</p>
        <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Biodiesel Blend (%)
              <input type="number" inputMode="decimal" min={ranges.blend.min} max={ranges.blend.max} value={blendPct} onChange={(e) => setBlendPct(e.target.value)} />
            </label>
            <input type="range" min={ranges.blend.min} max={ranges.blend.max} step={1} value={parseFloat(blendPct) || 0} onChange={(e) => setBlendPct(e.target.value)} />
            {outOfRange.blend && <span style={{ color: 'crimson' }}>Allowed {ranges.blend.min}–{ranges.blend.max} %</span>}
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Baseline CFPP (°{unitTemp})
              <input type="number" inputMode="decimal" min={ranges.temp.min} max={ranges.temp.max} value={baselineCfpp} onChange={(e) => setBaselineCfpp(e.target.value)} />
            </label>
            <input type="range" min={ranges.temp.min} max={ranges.temp.max} step={1} value={parseFloat(baselineCfpp) || 0} onChange={(e) => setBaselineCfpp(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select aria-label="Temperature unit" value={unitTemp} onChange={(e) => {
                const v = parseFloat(baselineCfpp)
                setUnitTemp(e.target.value as any)
                if (isFinite(v)) setBaselineCfpp(String(fromC(toC(v))))
              }}>
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
              {outOfRange.temp && <span style={{ color: 'crimson' }}>Allowed {ranges.temp.min.toFixed(0)}–{ranges.temp.max.toFixed(0)} °{unitTemp}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Target Improvement (°C)
              <input type="number" inputMode="decimal" min={0} max={40} value={targetImprovement} onChange={(e) => setTargetImprovement(e.target.value)} />
            </label>
            <div />
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>Improver Product
              <select value={product} onChange={(e) => setProduct(e.target.value as any)}>
                <option value="">Select product</option>
                <option value="CFI-X">CFI-X</option>
                <option value="CFI-Y">CFI-Y</option>
                <option value="CFI-Z">CFI-Z</option>
              </select>
            </label>
            <label>Feedstock Type
              <select value={feedstock} onChange={(e) => setFeedstock(e.target.value as any)}>
                <option value="">Select feedstock</option>
                <option value="soy">Soy</option>
                <option value="rapeseed">Rapeseed</option>
                <option value="uco">Used Cooking Oil</option>
                <option value="tallow">Tallow</option>
              </select>
            </label>
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={calc} disabled={!blendPct || !baselineCfpp || !targetImprovement || !product || !feedstock}>Calculate</button>
            <select aria-label="Dosage unit" value={unitDose} onChange={(e) => setUnitDose(e.target.value as any)}>
              <option value="ppm">ppm</option>
              <option value="wt%">wt %</option>
            </select>
          </div>
          <div className="card" style={{ background: '#f8fafc' }}>
            <div style={{ marginBottom: 8, color: '#6b7280' }}>Results update automatically after you click Calculate.</div>
            <div>Estimated dosage: {dosePpm !== null ? (unitDose === 'ppm' ? `${dosePpm} ppm` : `${toWtPercent(dosePpm).toFixed(3)} wt %`) : '-'}</div>
            <div>Predicted CFPP: {predCfppC !== null ? `${fromC(predCfppC).toFixed(1)} °${unitTemp}` : '-'}</div>
            {outOfRange.dose && <div style={{ color: 'crimson', marginTop: 4 }}>Dosage outside recommended range ({ranges.dose.min}–{ranges.dose.max} ppm)</div>}
            <div style={{ marginTop: 8, color: '#6b7280' }}>Model assumes ASTM D6371 test method; for unknown feedstock or severe contamination contact tech-service@yourcompany.com.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
