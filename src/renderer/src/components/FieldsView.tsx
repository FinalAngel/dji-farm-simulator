import { useEffect, useState } from 'react'
import type { Field, LngLat } from '@shared/types'
import FieldStats from './FieldStats'

interface Props {
  fields: Field[]
  selectedId: string | null
  drawing: boolean
  draft: LngLat[]
  /** Set when editing an existing field (drives prefilled form + "Update" labels). */
  editField: Field | null
  onSelect: (id: string) => void
  onStartDraw: () => void
  onStartEdit: (id: string) => void
  onPlan: (id: string) => void
  onClearSelection: () => void
  onUndoPoint: () => void
  onCancelDraw: () => void
  onSave: (name: string, notes: string) => void
  onDelete: (id: string) => void
  onLoadDemo: () => void
}

export default function FieldsView(p: Props): JSX.Element {
  const [menuId, setMenuId] = useState<string | null>(null)

  // A click anywhere in the sidebar that isn't a field row clears the selection and any open menu.
  // Scoped to .sidebar so clicks on the map or top bar never trigger a reset.
  useEffect(() => {
    const onDown = (e: MouseEvent): void => {
      const t = e.target as HTMLElement
      if (!t?.closest || !t.closest('.sidebar') || t.closest('.field-item-wrap')) return
      setMenuId(null)
      if (!p.drawing && p.selectedId) p.onClearSelection()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [p.drawing, p.selectedId, p.onClearSelection])

  return (
    <div>
      {p.drawing ? (
        <>
          {/* Instructions + drawing controls, kept separate from the field info below. */}
          <div className="card">
            <h3>{p.editField ? 'Edit field' : 'New field'}</h3>
            <div className="banner info" style={{ marginBottom: 12 }}>
              Click the map to drop boundary points. Drag a point to move it, shift-click a point to delete it.
            </div>
            <div className="row">
              <button className="small" disabled={p.draft.length === 0} onClick={p.onUndoPoint}>↩ Undo point</button>
              <button className="small" onClick={p.onCancelDraw}>Cancel</button>
              <div style={{ alignSelf: 'center', textAlign: 'right' }} className="muted">{p.draft.length} pts</div>
            </div>
          </div>

          <div className="card">
            <h3>Field information</h3>
            <FieldForm
              key={p.editField?.id ?? 'new'}
              editing={!!p.editField}
              initialName={p.editField?.name ?? ''}
              initialNotes={p.editField?.notes ?? ''}
              canSave={p.draft.length >= 3}
              onSave={p.onSave}
            />
          </div>

          <div className="card">
            <h3>Field size</h3>
            <FieldStats polygon={p.draft} />
          </div>
        </>
      ) : (
        <>
          <div className="plan-head">
            <div className="plan-name">Fields</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Draw a field boundary to plan coverage flights, count cattle and flag deer.
            </div>
          </div>

          {p.fields.length === 0 ? (
            <div className="empty-state">
              <div className="ico">🗺️</div>
              <div className="title">No fields yet</div>
              <div>Draw your first field below to get started, or load a demo to explore.</div>
              <button className="small demo" onClick={p.onLoadDemo}>Load a demo field 🇨🇭</button>
            </div>
          ) : (
            <div className="field-list">
              {p.fields.map((f) => (
              <div className="field-item-wrap" key={f.id}>
                <div
                  className={`field-item ${f.id === p.selectedId ? 'active' : ''}`}
                  onClick={() => { setMenuId(null); p.onSelect(f.id) }}
                >
                  <div className="meta">
                    <div className="name">{f.name}</div>
                    <div className="sub">{f.areaHa.toFixed(2)} ha · {f.polygon.length} pts</div>
                  </div>
                  <span className="menu-anchor">
                    <button
                      className="ghost small"
                      title="Actions"
                      aria-label="Field actions"
                      onClick={(e) => { e.stopPropagation(); setMenuId(menuId === f.id ? null : f.id) }}
                    >⋮</button>
                    {menuId === f.id && (
                      <div className="menu">
                        <button onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onPlan(f.id) }}>▶ Plan &amp; Fly</button>
                        <button onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onStartEdit(f.id) }}>✎ Edit</button>
                        <button className="danger" onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onDelete(f.id) }}>✕ Delete</button>
                      </div>
                    )}
                  </span>
                </div>
                </div>
              ))}
            </div>
          )}

          <button className="primary" style={{ width: '100%', marginTop: 14 }} onClick={p.onStartDraw}>
            + Draw a new field
          </button>
        </>
      )}
    </div>
  )
}

interface FormProps {
  editing: boolean
  initialName: string
  initialNotes: string
  canSave: boolean
  onSave: (name: string, notes: string) => void
}

function FieldForm(f: FormProps): JSX.Element {
  const [name, setName] = useState(f.initialName)
  const [notes, setNotes] = useState(f.initialNotes)

  return (
    <div>
      <label>Field name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North meadow" />
      <div style={{ height: 10 }} />
      <label>Notes (optional)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Slope, gate location, hazards…" />
      <div style={{ height: 12 }} />
      <button
        className="primary"
        style={{ width: '100%' }}
        disabled={!f.canSave}
        onClick={() => f.onSave(name.trim() || 'Untitled field', notes.trim())}
      >
        {f.editing ? 'Update field' : 'Save field'}
      </button>
    </div>
  )
}
