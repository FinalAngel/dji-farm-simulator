import { useEffect, useState } from 'react'
import type { Field, LngLat } from '@shared/types'
import FieldStats from './FieldStats'
import { useI18n } from '../i18n'

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
  const { t } = useI18n()
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
            <h3>{p.editField ? t('fields.editField') : t('fields.newField')}</h3>
            <div className="banner info" style={{ marginBottom: 12 }}>
              {t('fields.drawHint')}
            </div>
            <div className="row">
              <button className="small" disabled={p.draft.length === 0} onClick={p.onUndoPoint}>↩ {t('fields.undoPoint')}</button>
              <button className="small" onClick={p.onCancelDraw}>{t('common.cancel')}</button>
              <div style={{ alignSelf: 'center', textAlign: 'right' }} className="muted">{t('fields.draftPts', { count: p.draft.length })}</div>
            </div>
          </div>

          <div className="card">
            <h3>{t('fields.fieldInformation')}</h3>
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
            <h3>{t('fields.fieldSize')}</h3>
            <FieldStats polygon={p.draft} />
          </div>
        </>
      ) : (
        <>
          <div className="plan-head">
            <div className="plan-name">{t('nav.fields')}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {t('fields.subtitle')}
            </div>
          </div>

          {p.fields.length === 0 ? (
            <div className="empty-state">
              <div className="ico">🗺️</div>
              <div className="title">{t('fields.noFieldsTitle')}</div>
              <div>{t('fields.noFieldsBody')}</div>
              <button className="small demo" onClick={p.onLoadDemo}>{t('fields.loadDemo')}</button>
            </div>
          ) : (
            <div className="field-list">
              {p.fields.map((f) => (
              <div className="field-item-wrap" key={f.id}>
                <div
                  className={`field-item ${f.id === p.selectedId ? 'active' : ''}`}
                  onClick={() => { setMenuId(null); p.onSelect(f.id) }}
                  onDoubleClick={() => p.onPlan(f.id)}
                >
                  <div className="meta">
                    <div className="name">{f.name}</div>
                    <div className="sub">{t('fields.itemSub', { area: f.areaHa.toFixed(2), points: f.polygon.length })}</div>
                  </div>
                  <span className="menu-anchor">
                    <button
                      className="ghost small"
                      title={t('fields.actions')}
                      aria-label={t('fields.actionsAria')}
                      onClick={(e) => { e.stopPropagation(); setMenuId(menuId === f.id ? null : f.id) }}
                    >⋮</button>
                    {menuId === f.id && (
                      <div className="menu">
                        <button onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onPlan(f.id) }}>▶ {t('nav.planFly')}</button>
                        <button onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onStartEdit(f.id) }}>✎ {t('common.edit')}</button>
                        <button className="danger" onClick={(e) => { e.stopPropagation(); setMenuId(null); p.onDelete(f.id) }}>✕ {t('common.delete')}</button>
                      </div>
                    )}
                  </span>
                </div>
                </div>
              ))}
            </div>
          )}

          <button className="primary" style={{ width: '100%', marginTop: 14 }} onClick={p.onStartDraw}>
            {t('fields.drawNew')}
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
  const { t } = useI18n()
  const [name, setName] = useState(f.initialName)
  const [notes, setNotes] = useState(f.initialNotes)

  return (
    <div>
      <label>{t('fields.nameLabel')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fields.namePlaceholder')} />
      <div style={{ height: 10 }} />
      <label>{t('fields.notesLabel')}</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('fields.notesPlaceholder')} />
      <div style={{ height: 12 }} />
      <button
        className="primary"
        style={{ width: '100%' }}
        disabled={!f.canSave}
        onClick={() => f.onSave(name.trim() || t('fields.untitled'), notes.trim())}
      >
        {f.editing ? t('fields.updateField') : t('fields.saveField')}
      </button>
    </div>
  )
}
