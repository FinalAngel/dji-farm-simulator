import { useState } from 'react'
import type { Field } from '@shared/types'

interface Props {
  fields: Field[]
  selectedId: string | null
  drawing: boolean
  draftLen: number
  onSelect: (id: string) => void
  onStartDraw: () => void
  onUndoPoint: () => void
  onCancelDraw: () => void
  onSave: (name: string, notes: string) => void
  onDelete: (id: string) => void
  onLoadDemo: () => void
}

export default function FieldsView(p: Props): JSX.Element {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  const save = (): void => {
    p.onSave(name.trim() || 'Untitled field', notes.trim())
    setName('')
    setNotes('')
  }

  return (
    <div>
      <div className="card">
        <h3>Fields</h3>
        {!p.drawing && (
          <button className="primary" style={{ width: '100%' }} onClick={p.onStartDraw}>
            + Draw a new field
          </button>
        )}

        {p.drawing && (
          <div>
            <div className="banner info">
              Click the map to drop boundary points. Add at least 3, then name and save the field.
            </div>
            <div className="row" style={{ marginBottom: 10 }}>
              <button className="small" disabled={p.draftLen === 0} onClick={p.onUndoPoint}>↩ Undo point</button>
              <button className="small" onClick={p.onCancelDraw}>Cancel</button>
              <div style={{ alignSelf: 'center', textAlign: 'right' }} className="muted">{p.draftLen} pts</div>
            </div>
            <label>Field name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North meadow" />
            <div style={{ height: 8 }} />
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Slope, gate location, hazards…" />
            <div style={{ height: 10 }} />
            <button className="primary" style={{ width: '100%' }} disabled={p.draftLen < 3} onClick={save}>
              Save field
            </button>
          </div>
        )}
      </div>

      <div className="field-list">
        {p.fields.length === 0 && !p.drawing && (
          <div className="empty">
            No fields yet. Draw your first field above —
            <br />or
            <br />
            <button className="small" style={{ marginTop: 10 }} onClick={p.onLoadDemo}>Load a demo field 🇨🇭</button>
          </div>
        )}
        {p.fields.map((f) => (
          <div
            key={f.id}
            className={`field-item ${f.id === p.selectedId ? 'active' : ''}`}
            onClick={() => p.onSelect(f.id)}
          >
            <div className="meta">
              <div className="name">{f.name}</div>
              <div className="sub">{f.areaHa.toFixed(2)} ha · {f.polygon.length} pts</div>
            </div>
            <button className="ghost small danger" title="Delete field" onClick={(e) => { e.stopPropagation(); p.onDelete(f.id) }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
