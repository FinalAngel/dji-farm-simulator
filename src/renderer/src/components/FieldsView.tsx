import { useState } from 'react'
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
  return (
    <div>
      <div className="card">
        <h3>{p.editField ? 'Edit field' : 'Fields'}</h3>
        {!p.drawing && (
          <button className="primary" style={{ width: '100%' }} onClick={p.onStartDraw}>
            + Draw a new field
          </button>
        )}

        {p.drawing && (
          // Keyed so switching between new-draw and editing different fields resets the inputs.
          <FieldForm
            key={p.editField?.id ?? 'new'}
            editing={!!p.editField}
            initialName={p.editField?.name ?? ''}
            initialNotes={p.editField?.notes ?? ''}
            draftLen={p.draft.length}
            onUndoPoint={p.onUndoPoint}
            onCancelDraw={p.onCancelDraw}
            onSave={p.onSave}
          />
        )}
      </div>

      {/* Live size readout while drawing/editing. */}
      {p.drawing && (
        <div className="card">
          <h3>Field size</h3>
          <FieldStats polygon={p.draft} />
        </div>
      )}

      {/* List is hidden while drawing/editing so you can't accidentally switch fields and lose progress. */}
      {!p.drawing && (
        <div className="field-list">
          {p.fields.length === 0 && (
            <div className="empty">
              No fields yet. Draw your first field above —
              <br />or
              <br />
              <button className="small" style={{ marginTop: 10 }} onClick={p.onLoadDemo}>Load a demo field 🇨🇭</button>
            </div>
          )}
          {p.fields.map((f) => (
            <div key={f.id}>
              <div
                className={`field-item ${f.id === p.selectedId ? 'active' : ''}`}
                onClick={() => p.onSelect(f.id)}
              >
                <div className="meta">
                  <div className="name">{f.name}</div>
                  <div className="sub">{f.areaHa.toFixed(2)} ha · {f.polygon.length} pts</div>
                </div>
                <button className="ghost small" title="Edit field" onClick={(e) => { e.stopPropagation(); p.onStartEdit(f.id) }}>✎</button>
                <button className="ghost small danger" title="Delete field" onClick={(e) => { e.stopPropagation(); p.onDelete(f.id) }}>✕</button>
              </div>
              {/* Contextual actions so you don't have to hop up to the nav after selecting. */}
              {f.id === p.selectedId && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    className="primary small"
                    style={{ flex: 1 }}
                    onClick={(e) => { e.stopPropagation(); p.onPlan(f.id) }}
                  >
                    ▶ Plan &amp; Fly this field →
                  </button>
                  <button
                    className="small"
                    title="Deselect this field"
                    onClick={(e) => { e.stopPropagation(); p.onClearSelection() }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface FormProps {
  editing: boolean
  initialName: string
  initialNotes: string
  draftLen: number
  onUndoPoint: () => void
  onCancelDraw: () => void
  onSave: (name: string, notes: string) => void
}

function FieldForm(f: FormProps): JSX.Element {
  const [name, setName] = useState(f.initialName)
  const [notes, setNotes] = useState(f.initialNotes)

  return (
    <div>
      <div className="banner info">
        Click the map to drop boundary points. Drag a point to move it, shift-click a point to delete it.
        Add at least 3, then {f.editing ? 'update' : 'name and save'} the field.
      </div>
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="small" disabled={f.draftLen === 0} onClick={f.onUndoPoint}>↩ Undo point</button>
        <button className="small" onClick={f.onCancelDraw}>Cancel</button>
        <div style={{ alignSelf: 'center', textAlign: 'right' }} className="muted">{f.draftLen} pts</div>
      </div>
      <label>Field name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North meadow" />
      <div style={{ height: 8 }} />
      <label>Notes (optional)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Slope, gate location, hazards…" />
      <div style={{ height: 10 }} />
      <button
        className="primary"
        style={{ width: '100%' }}
        disabled={f.draftLen < 3}
        onClick={() => f.onSave(name.trim() || 'Untitled field', notes.trim())}
      >
        {f.editing ? 'Update field' : 'Save field'}
      </button>
    </div>
  )
}
