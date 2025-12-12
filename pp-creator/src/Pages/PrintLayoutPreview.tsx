import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

type CropRect = { srcX: number; srcY: number; srcW: number; srcH: number; imgW: number; imgH: number };

interface PrintLayoutPreviewProps {
  uploadedUrl: string | null;
  cropRect?: CropRect | null;
  onBack?: () => void;
  cellBorderEnabled: boolean;
  setCellBorderEnabled: (v: boolean) => void;
  cellBorderMm: number;
  setCellBorderMm: (n: number) => void;
  cellBorderStyle: 'solid' | 'dashed';
  setCellBorderStyle: (s: 'solid' | 'dashed') => void;
  cellBorderColor: string;
  setCellBorderColor: (c: string) => void;
}

export default function PrintLayoutPreview({
  uploadedUrl,
  cropRect,
  onBack,
  cellBorderEnabled,
  setCellBorderEnabled,
  cellBorderMm,
  setCellBorderMm,
  cellBorderStyle,
  setCellBorderStyle,
  cellBorderColor,
  setCellBorderColor
}: PrintLayoutPreviewProps) {
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

  useEffect(() => {
    // cleanup object URL when component unmounts or sheet changes
    return () => {
      if (sheetUrl) URL.revokeObjectURL(sheetUrl);
    };
  }, [sheetUrl]);

  async function loadImageFromFile(objectUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;
    });
  }

  async function generateFromUploaded() {
    if (!uploadedUrl) {
      setSheetUrl(null);
      return;
    }
    setProcessing(true);
    try {
      const img = await loadImageFromFile(uploadedUrl);
      const DPI = 300;
      const sheetW = (layout === 'horizontal' ? 6 : 4) * DPI;
      const sheetH = (layout === 'horizontal' ? 4 : 6) * DPI;
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
      if (!ctx) throw new Error('No canvas context');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = marginPx + c * (cellW + gutterPx);
          const y = marginPx + r * (cellH + gutterPx);

          if (cropRect && cropRect.srcW > 0 && cropRect.srcH > 0) {
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
          }

          // cell border
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

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 1.0));
      if (!blob) throw new Error('blob fail');
      const u = URL.createObjectURL(blob);
      if (sheetUrl) URL.revokeObjectURL(sheetUrl);
      setSheetUrl(u);
    } catch (e) {
      // eslint-disable-next-line no-console
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">perm_identity</span>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>PassportMaker</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={() => onBack && onBack()}>Edit Crop</Button>
            <Stack direction="row" spacing={1} alignItems="center">
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>check</span>
              <Typography variant="caption">300 DPI (High Quality)</Typography>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
        <Box component={Paper} elevation={0} square sx={{ width: 360, borderRight: '1px solid', borderColor: 'divider', p: 2 }}>
          <Typography variant="h6">Print Settings</Typography>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button variant={scaleMode === 'contain' ? 'contained' : 'outlined'} onClick={() => setScaleMode('contain')}>Fit</Button>
              <Button variant={scaleMode === 'cover' ? 'contained' : 'outlined'} onClick={() => setScaleMode('cover')}>Fill</Button>
            </Stack>

            <TextField label="Gutter (mm)" type="number" value={gutterMm} onChange={(e) => setGutterMm(Number(e.target.value) || 0)} fullWidth sx={{ mb: 2 }} />
            <TextField label="Margin (mm)" type="number" value={marginMm} onChange={(e) => setMarginMm(Number(e.target.value) || 0)} fullWidth sx={{ mb: 2 }} />

            <FormControlLabel control={<Switch checked={cellBorderEnabled} onChange={(e) => setCellBorderEnabled(e.target.checked)} />} label="Add border to each image" />

            {cellBorderEnabled && (
              <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 80px', gap: 1 }}>
                <TextField label="Border width (mm)" type="number" value={cellBorderMm} inputProps={{ step: 0.05 }} onChange={(e) => setCellBorderMm(Number(e.target.value) || 0)} />
                <TextField label="Color" type="color" value={cellBorderColor} onChange={(e) => setCellBorderColor(e.target.value)} />
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant={cellBorderStyle === 'solid' ? 'contained' : 'outlined'} onClick={() => setCellBorderStyle('solid')}>Solid</Button>
                  <Button variant={cellBorderStyle === 'dashed' ? 'contained' : 'outlined'} onClick={() => setCellBorderStyle('dashed')}>Dashed</Button>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button onClick={generateFromUploaded} disabled={!uploadedUrl || processing} variant="contained" fullWidth>Generate 4R (8-up)</Button>
              <Button onClick={downloadSheet} disabled={!sheetUrl} variant="outlined">Download</Button>
              <Button onClick={printSheet} disabled={!sheetUrl} variant="outlined">Print</Button>
            </Stack>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, p: 3, bgcolor: 'background.default', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ width: `${previewWidthMm}mm`, height: `${previewHeightMm}mm`, background: '#fff', boxShadow: 3, p: '12mm', borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 1, top: 1, bgcolor: 'rgba(0,0,0,0.66)', color: '#fff', px: 1, py: '2px', borderRadius: 1, fontSize: 12, zIndex: 3 }}>
                {pageWidthIn} x {pageHeightIn} in · 300 DPI
              </Box>

              {!sheetUrl && (
                <Box sx={{ color: 'text.secondary', textAlign: 'center', mt: 6 }}>
                  <Typography>No sheet generated yet. Click Generate to compose the 4R sheet from your uploaded photo.</Typography>
                </Box>
              )}

              {sheetUrl && (
                <Box component="img" src={sheetUrl} alt="generated sheet" sx={{ width: '100%', height: '100%', display: 'block', borderRadius: 1, objectFit: 'contain' }} />
              )}
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Sheet: {pageWidthIn} × {pageHeightIn} in — Margin: {marginMm}mm · Gutter: {gutterMm}mm · 300 DPI{cellBorderEnabled ? ` · Border: ${cellBorderMm}mm ${cellBorderStyle} ${cellBorderColor}` : ''}
            </Typography>
          </Box>

          <Typography sx={{ mt: 2, color: 'text.secondary' }} variant="body2">Preview is approximate. Final print quality depends on printer settings.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
