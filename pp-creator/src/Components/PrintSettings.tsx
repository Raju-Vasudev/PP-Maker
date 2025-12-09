import React from 'react';

export default function PrintSettings(): JSX.Element {
  return (
    <div>
      <h3 style={{ margin: '0 0 8px 0' }}>Print Layout</h3>
      <p style={{ margin: '0 0 16px 0', color: 'rgba(0,0,0,0.6)' }}>Configure your sheet settings and layout before printing.</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>Paper Size</label>
        <select style={{ width: '100%', padding: 8, marginTop: 6 }} defaultValue="A4">
          <option value="A4">A4 (210 x 297 mm)</option>
          <option value="Letter">US Letter (8.5 x 11 in)</option>
          <option value="4x6">4 x 6 inch</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Width</div>
          <div style={{ fontWeight: 700 }}>600 px</div>
        </div>
        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Height</div>
          <div style={{ fontWeight: 700 }}>900 px</div>
        </div>
      </div>

      <div style={{ background: '#eef2ff', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 20, color: '#0d7ff2' }}>i</div>
          <div style={{ fontSize: 13 }}>
            Auto-fit enabled. 8 photos fit on A4 with 5mm margins.
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>Copies</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={{ padding: '6px 10px' }}>-</button>
          <input type="number" defaultValue={8} style={{ width: 60, textAlign: 'center' }} />
          <button style={{ padding: '6px 10px' }}>+</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: 10, background: '#0d7ff2', color: '#fff', border: 'none', borderRadius: 8 }}>Print Sheet</button>
        <button style={{ flex: 1, padding: 10, borderRadius: 8 }}>Save Image</button>
      </div>
    </div>
  );
}
