import React, { useState } from 'react';
// PrintSettings exists but we'll inline controls here to keep state local

const sampleImgs = [
  // use a few placeholder images (from mocks) to populate the preview grid
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAw8B9I_v20jHDsVyagvO93Fa5WMGBdPaltg4xqpLX8_0IVyhGZX0U-1c0v4v7szZLsF49jKp9oxX_KkF1mUzC8_EUu03q94a4hnvUV-dA15QgrTWF-UXmDw-6ei_cIFQ1rNRe-VbkDzhSCzlNd0fyZzzyWl-r2aM_poBlLuzLE7Y0-bePeVk3cNGqcE5D_Z4W74TrKmmGGS7XLB8yNQuOzQGJid-vNavOQK3f2h6Ls5z8G4gqbhQ8fvqtDiDSknTOwYdgr3-kTLlI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2RT6eqNgJDQsdYIPipRnLIHyxIUi1p5bmF5UYJULqOQNZqTVLZTyAOzZ7t1B5CUEOTypFRC1u-426ilwNPBwLMpm9j03yMAhK5uEN2sz9MB8ZwVkOi-HHUwr-4P1BxrkwAzcRhpdZI5Tq2vnT8vQ1AAdx1mnw8Rnk2l0RmVBCSBIeFNyXuaslcwdi1Uu6ckEaDD8yNiXriGkksd_umwqDSlTw8x9nqkbmxYzXltdH8TcZ3U265qZ8SvxAoUxWyyuxJ7C-USAob0A',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2oF3-pJY49YoFr78FqbAZoa6nCUyW8KgCLJpDfFfIRiCJg-AoIrCFvA8Im0U8jHmK2ZIzto_ibrkh0R_gb9homS4DtNGj8Umzn2pQSdEwWcM54Ez33de3W7q2H92pWfrkSbyb8g6HhdjH1pl3pEILjFxrEpJosF4kZr_JLBYhwrT8BvKHfw-8rcvaWXODHikYtUvOImeUrdqwaKeKOSpCc_PCKCMm8RVPj_uVpB4hZV1KwV5pgHRCGb-QBZzQKV5ODEi6NGxz_pQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJxIqQ2u2BbBhaPYorPA3C92fqFtJauOcEbygO8VhDfkMeRjPMGmpuRQ0UhNEVo4FUKJm2Zsv5vR3bvqqNzosd1y3CUfAVKt9f10tCIE9VVt4WVAzqBGm77laJjLPRVulAh4yumlzUB1rrkbADtmqzFZc9GN-sr3QTfEeJrdVeE8kU2V6kna7fse1QEKcPdVgNVYdRTNDFwoTI4olycqh1LAgtM8wIqpyzfgD5Ny48qhVWruQ-AfgcH7L9FTapxxISgIzbdNO1UU0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCaXJnhfON1wNrc1wl-v1Z48-9Ug4tQL-rK66jcEYqdrBDoGkLxTdd_bVOeoIbyDa8MUdj2vbAU0zuP6BvWYjcKZ5ij7X-m75peXczxUPPqw-KXo_lvU-x6hwAUYC19fCMT23tb91kDDZQstQcmBHPnTlqZcCwOYk3bPZ776FXTPoNUydZ-SDpcGhP3nKeEGi1FoFQ9Sqyd4Hp3b9kCjS3ZSj6fB_q8sDN7CSJHZRUNqb24UpS-dGtXLiRdI_PddZbmz0EVNVw58T4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJgmiFXaSyrzvi8K1_eEjD-RxxjT_1EkzEEWkxF-542cKf7v0eNmAE8cHRs6aPER6Zoem9NNSMD3JKEbFbUT-NzN25_xFp5r8uYDSKIxtTG1FmX5TLvt8hJICtwUTeP84-korfkfxusLyiMjQcwFIOtepD2IcGJLSd7pYV1ZAxu6lBuAOYTgKVlye60E5-9vDfthKnoREcAZrhohNJbY9XzGbzM890ZakV4D1G8I5ftnuRXJbBMBPnROEVEw3Y04beyBRvgR3HRi4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJD1QajtyY7nNh7GNBQC9qlLB70LfXQgXgOKHFLyIK-ZRuz51R2qZSCWKP2VuZ8qAxeO_dPfgwEPm49AClODabwuw3pmChXOq8Dus8TemlCoOFG3M6WG0yv8HZzBh3ixMCMCp26WiTpMJdlpE7sQx1CvA-g-oXxKV8UVWL4ohqlcSkBAsVN1Ei_8EqTh69ka8UPic3vjfvlkQWtyAs5vH6-k1Iy9wMsc97wSwkmGqzrQSo0GGz4cXWOTg9Pw7hTPoZod466F0uZo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsIl3U6UOJQRjcuOQanN9PGZVZ_8rhYQK-L4zbp56W3B6zHvqFL6t8DSezKYXzLdibXa361iNfWb0gzBLdXvybgMlTDRwJWkCC3Wyi0cQCK0AyZU7CmQKrlEBR6FgdLvbenYfdnoSxCPBUUlR5mTonV_2y6NGTv_OTnsd2c_VMrbEJgRvxk95l4QhfwVR-BcZ7LxO8SD_xcv41VQsVhLvgkTcUhNOLiYFatSE3_llgqNnw5Pf2VoK7UjlPHRmt3Cyw9A8FpIA4UEg'
];

export default function PrintLayoutPreview({ uploadedUrl, cropRect, onBack, cellBorderEnabled, setCellBorderEnabled, cellBorderMm, setCellBorderMm, cellBorderStyle, setCellBorderStyle, cellBorderColor, setCellBorderColor }: { uploadedUrl: string | null; cropRect?: { srcX: number; srcY: number; srcW: number; srcH: number; imgW: number; imgH: number } | null; onBack?: () => void; cellBorderEnabled: boolean; setCellBorderEnabled: (v: boolean) => void; cellBorderMm: number; setCellBorderMm: (n: number) => void; cellBorderStyle: 'solid' | 'dashed'; setCellBorderStyle: (s: 'solid' | 'dashed') => void; cellBorderColor: string; setCellBorderColor: (c: string) => void; }): JSX.Element {
  const [scaleMode, setScaleMode] = useState<'cover' | 'contain'>('contain');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [gutterMm, setGutterMm] = useState<number>(5);
  const [marginMm, setMarginMm] = useState<number>(5);
  const [processing, setProcessing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  // derive preview page size (inches/mm) from layout selection
  const pageWidthIn = layout === 'horizontal' ? 6 : 4;
  const pageHeightIn = layout === 'horizontal' ? 4 : 6;
  const previewWidthMm = pageWidthIn * 25.4;
  const previewHeightMm = pageHeightIn * 25.4;

  function loadImageFromFile(objectUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;
    });
  }

  async function generateFromUploaded() {
    if (!uploadedUrl) return setSheetUrl(null);
    setProcessing(true);
    try {
      const img = await loadImageFromFile(uploadedUrl);
      const DPI = 300;
      let sheetW: number;
      let sheetH: number;
      if (layout === 'horizontal') {
        sheetW = 6 * DPI;
        sheetH = 4 * DPI;
      } else {
        sheetW = 4 * DPI;
        sheetH = 6 * DPI;
      }
      const cols = layout === 'horizontal' ? 4 : 2;
      const rows = layout === 'horizontal' ? 2 : 4;
      const gutterPx = Math.round((gutterMm / 25.4) * DPI);
      const marginPx = Math.round((marginMm / 25.4) * DPI);
      const usableW = sheetW - marginPx * 2 - (cols - 1) * gutterPx;
      const usableH = sheetH - marginPx * 2 - (rows - 1) * gutterPx;
      const cellW = Math.floor(usableW / cols);
      const cellH = Math.floor(usableH / rows);

      const canvas = document.createElement('canvas');
      canvas.width = sheetW;
      canvas.height = sheetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No ctx');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // simple fill behavior: if cropRect provided, use it as source rect; otherwise use whole image
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = marginPx + c * (cellW + gutterPx);
          const y = marginPx + r * (cellH + gutterPx);
          if (cropRect && cropRect.srcW > 0 && cropRect.srcH > 0) {
            // use crop source rect
            let { srcX, srcY, srcW, srcH } = cropRect;
            const destAspect = cellW / cellH;
            if (scaleMode === 'cover') {
              const srcAspect = srcW / srcH;
              if (srcAspect > destAspect) {
                const newSrcW = srcH * destAspect;
                srcX = srcX + (srcW - newSrcW) / 2;
                srcW = newSrcW;
              } else if (srcAspect < destAspect) {
                const newSrcH = srcW / destAspect;
                srcY = srcY + (srcH - newSrcH) / 2;
                srcH = newSrcH;
              }
              ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, cellW, cellH);
            } else {
              const scaleDest = Math.min(cellW / srcW, cellH / srcH);
              const drawW = srcW * scaleDest;
              const drawH = srcH * scaleDest;
              const destX = x + (cellW - drawW) / 2;
              const destY = y + (cellH - drawH) / 2;
              ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, drawW, drawH);
            }
              // draw border for this cell if enabled
              if (cellBorderEnabled) {
                const borderPx = Math.max(0.5, Math.round((cellBorderMm / 25.4) * DPI));
                ctx.save();
                ctx.strokeStyle = cellBorderColor;
                ctx.lineWidth = borderPx;
                if (cellBorderStyle === 'dashed') ctx.setLineDash([Math.max(2, borderPx * 2), Math.max(2, borderPx * 2)]);
                else ctx.setLineDash([]);
                // inset by half the line width so stroke lies inside the cell
                const half = ctx.lineWidth / 2;
                ctx.strokeRect(x + half, y + half, cellW - ctx.lineWidth, cellH - ctx.lineWidth);
                ctx.restore();
              }
          } else {
            if (scaleMode === 'cover') {
              const scale = Math.max(cellW / imgW, cellH / imgH);
              const drawW = imgW * scale;
              const drawH = imgH * scale;
              const dx = x + (cellW - drawW) / 2;
              const dy = y + (cellH - drawH) / 2;
              ctx.drawImage(img, dx, dy, drawW, drawH);
            } else {
              const scale = Math.min(cellW / imgW, cellH / imgH);
              const drawW = imgW * scale;
              const drawH = imgH * scale;
              const dx = x + (cellW - drawW) / 2;
              const dy = y + (cellH - drawH) / 2;
              ctx.drawImage(img, dx, dy, drawW, drawH);
            }
              // draw border for this cell if enabled
              if (cellBorderEnabled) {
                const borderPx = Math.max(0.5, Math.round((cellBorderMm / 25.4) * DPI));
                ctx.save();
                ctx.strokeStyle = cellBorderColor;
                ctx.lineWidth = borderPx;
                if (cellBorderStyle === 'dashed') ctx.setLineDash([Math.max(2, borderPx * 2), Math.max(2, borderPx * 2)]);
                else ctx.setLineDash([]);
                const half = ctx.lineWidth / 2;
                ctx.strokeRect(x + half, y + half, cellW - ctx.lineWidth, cellH - ctx.lineWidth);
                ctx.restore();
              }
          }
        }
      }

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 1.0));
      if (!blob) throw new Error('blob fail');
      const u = URL.createObjectURL(blob);
      if (sheetUrl) URL.revokeObjectURL(sheetUrl);
      setSheetUrl(u);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }

  function downloadSheet() {
    if (!sheetUrl) return;
    const a = document.createElement('a');
    a.href = sheetUrl;
    a.download = `4R_sheet_${layout}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function printSheet() {
    if (!sheetUrl) return;
    const pageWidth = layout === 'horizontal' ? 6 : 4;
    const pageHeight = layout === 'horizontal' ? 4 : 6;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><style>@page{size:${pageWidth}in ${pageHeight}in;margin:0}html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="${sheetUrl}"/></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f5f7f8)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(13,127,242,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">perm_identity</span>
          </div>
          <h2 style={{ margin: 0 }}>PassportMaker</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => onBack && onBack()} style={{ padding: '8px 12px', marginRight: 8, borderRadius: 6 }}>Edit Crop</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
            <span className="material-symbols-outlined">check</span>
            <span style={{ fontSize: 13 }}>300 DPI (High Quality)</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
        <aside style={{ width: 360, borderRight: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
          <div style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Print Settings</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setScaleMode('contain')} style={{ padding: 8, borderRadius: 6, background: scaleMode === 'contain' ? '#eef2ff' : '#fff' }}>Fit</button>
                <button onClick={() => setScaleMode('cover')} style={{ padding: 8, borderRadius: 6, background: scaleMode === 'cover' ? '#eef2ff' : '#fff' }}>Fill</button>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12 }}>Gutter (mm)</label>
              <input type="number" value={gutterMm} onChange={(e) => setGutterMm(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12 }}>Margin (mm)</label>
              <input type="number" value={marginMm} onChange={(e) => setMarginMm(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={cellBorderEnabled} onChange={(e) => setCellBorderEnabled(e.target.checked)} /> Add border to each image
              </label>
              {cellBorderEnabled && (
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 72px', gap: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12 }}>Border width (mm)</label>
                    <input type="number" value={cellBorderMm} step={0.05} min={0} onChange={(e) => setCellBorderMm(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12 }}>Color</label>
                    <input type="color" value={cellBorderColor} onChange={(e) => setCellBorderColor(e.target.value)} style={{ width: '100%', height: 40, padding: 4 }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, marginTop: 6 }}>
                    <button onClick={() => setCellBorderStyle('solid')} style={{ padding: 8, borderRadius: 6, background: cellBorderStyle === 'solid' ? '#eef2ff' : '#fff' }}>Solid</button>
                    <button onClick={() => setCellBorderStyle('dashed')} style={{ padding: 8, borderRadius: 6, background: cellBorderStyle === 'dashed' ? '#eef2ff' : '#fff' }}>Dashed</button>
                  </div>
                </div>
              )}
            </div>
            {/* Bleed control hidden per user request */}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={generateFromUploaded} disabled={!uploadedUrl || processing} style={{ padding: 10, flex: 1 }}>Generate 4R (8-up)</button>
              <button onClick={downloadSheet} disabled={!sheetUrl} style={{ padding: 10 }}>Download</button>
              <button onClick={printSheet} disabled={!sheetUrl} style={{ padding: 10 }}>Print</button>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 24, background: 'var(--bg, #f5f7f8)', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: `${previewWidthMm}mm`, height: `${previewHeightMm}mm`, background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '12mm', boxSizing: 'border-box', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
              {/* Sheet size label (top-left) */}
              <div style={{ position: 'absolute', left: 8, top: 8, background: 'rgba(0,0,0,0.66)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12, zIndex: 3 }}>
                {pageWidthIn} x {pageHeightIn} in · 300 DPI
              </div>

              {!sheetUrl && (
                <div style={{ color: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
                  <p style={{ marginTop: 36 }}>No sheet generated yet. Click Generate to compose the 4R sheet from your uploaded photo.</p>
                </div>
              )}
              {sheetUrl && (
                <img src={sheetUrl} alt="generated sheet" style={{ width: '100%', height: '100%', display: 'block', borderRadius: 4, objectFit: 'contain' }} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>
              Sheet: {pageWidthIn} × {pageHeightIn} in — Margin: {marginMm}mm · Gutter: {gutterMm}mm · 300 DPI
              {cellBorderEnabled ? ` · Border: ${cellBorderMm}mm ${cellBorderStyle} ${cellBorderColor}` : ''}
            </div>
          </div>
          <p style={{ marginTop: 16, color: 'rgba(0,0,0,0.6)', fontSize: 13 }}>Preview is approximate. Final print quality depends on printer settings.</p>
        </main>
      </div>
    </div>
  );
}
