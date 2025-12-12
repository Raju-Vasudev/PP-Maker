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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

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

const DEFAULT_PASSPORT_SETTINGS = { size: '35x45', widthMm: 35, heightMm: 45 } as const;
const PASSPORT_SIZE_OPTIONS = {
  '35x45': { label: '35 × 45 mm (Common)', widthMm: 35, heightMm: 45 },
  '40x50': { label: '40 × 50 mm', widthMm: 40, heightMm: 50 },
  '51x51': { label: '51 × 51 mm', widthMm: 51, heightMm: 51 },
} as const;
type PassportSizeKey = keyof typeof PASSPORT_SIZE_OPTIONS;

function isStandardPassportSize(value: string): value is PassportSizeKey {
  return Object.prototype.hasOwnProperty.call(PASSPORT_SIZE_OPTIONS, value);
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

  const STORAGE_KEYS = {
    uploadedUrl: 'pp_creator_uploadedUrl',
    cropRect: 'pp_creator_cropRect',
    passportSettings: 'pp_creator_passportSettings'
  } as const;

  const [resolvedPassport, setResolvedPassport] = useState<{ size: string; widthMm: number; heightMm: number }>(() => ({ ...DEFAULT_PASSPORT_SETTINGS }));
  const [passportWidthInput, setPassportWidthInput] = useState<string>(() => DEFAULT_PASSPORT_SETTINGS.widthMm.toString());
  const [passportHeightInput, setPassportHeightInput] = useState<string>(() => DEFAULT_PASSPORT_SETTINGS.heightMm.toString());

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.passportSettings);
      if (p) {
        const parsed = JSON.parse(p) as { size?: string; widthMm?: number; heightMm?: number };
        setResolvedPassport({
          size: parsed.size ?? DEFAULT_PASSPORT_SETTINGS.size,
          widthMm: parsed.widthMm ?? DEFAULT_PASSPORT_SETTINGS.widthMm,
          heightMm: parsed.heightMm ?? DEFAULT_PASSPORT_SETTINGS.heightMm
        });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    setPassportWidthInput(resolvedPassport.widthMm.toString());
    setPassportHeightInput(resolvedPassport.heightMm.toString());
  }, [resolvedPassport.widthMm, resolvedPassport.heightMm]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.passportSettings, JSON.stringify(resolvedPassport));
    } catch (e) {
      // ignore
    }
  }, [resolvedPassport]);

  function handlePassportSizeSelection(value: string) {
    if (isStandardPassportSize(value)) {
      const preset = PASSPORT_SIZE_OPTIONS[value];
      setResolvedPassport({ size: value, widthMm: preset.widthMm, heightMm: preset.heightMm });
      return;
    }
    setResolvedPassport((prev) => ({ ...prev, size: 'custom' }));
  }

  function handlePassportWidthChange(value: string) {
    setPassportWidthInput(value);
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      setResolvedPassport((prev) => ({ ...prev, size: 'custom', widthMm: parsed }));
    }
  }

  function handlePassportHeightChange(value: string) {
    setPassportHeightInput(value);
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      setResolvedPassport((prev) => ({ ...prev, size: 'custom', heightMm: parsed }));
    }
  }

  const [resolvedUploadedUrl, setResolvedUploadedUrl] = useState<string | null>(uploadedUrl ?? null);
  const [resolvedCropRect, setResolvedCropRect] = useState<CropRect | null>(cropRect ?? null);

  useEffect(() => {
    if (uploadedUrl) {
      setResolvedUploadedUrl(uploadedUrl);
      return;
    }
    try {
      const u = localStorage.getItem(STORAGE_KEYS.uploadedUrl);
      if (u) setResolvedUploadedUrl(u);
    } catch (e) {
      // ignore
    }
  }, [uploadedUrl]);

  useEffect(() => {
    if (cropRect) {
      setResolvedCropRect(cropRect);
      return;
    }
    try {
      const c = localStorage.getItem(STORAGE_KEYS.cropRect);
      if (c) {
        const parsed = JSON.parse(c) as CropRect;
        setResolvedCropRect(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, [cropRect]);

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
    const uUrl = resolvedUploadedUrl;
    if (!uUrl) {
      setSheetUrl(null);
      return;
    }
    setProcessing(true);
    try {
      const img = await loadImageFromFile(uUrl);
      const DPI = 300;
      const sheetW = (layout === 'horizontal' ? 6 : 4) * DPI;
      const sheetH = (layout === 'horizontal' ? 4 : 6) * DPI;
      const cols = layout === 'horizontal' ? 4 : 2;
      const rows = layout === 'horizontal' ? 2 : 4;
      const gutterPx = Math.round((gutterMm / 25.4) * DPI);
      const marginPx = Math.round((marginMm / 25.4) * DPI);
      const usableW = sheetW - marginPx * 2 - (cols - 1) * gutterPx;
      const usableH = sheetH - marginPx * 2 - (rows - 1) * gutterPx;
      const passportPxW = Math.max(0, Math.round((resolvedPassport.widthMm / 25.4) * DPI));
      const passportPxH = Math.max(0, Math.round((resolvedPassport.heightMm / 25.4) * DPI));
      const maxCellW = usableW / cols;
      const maxCellH = usableH / rows;
      const cellW = passportPxW > 0 ? Math.min(passportPxW, maxCellW) : maxCellW;
      const cellH = passportPxH > 0 ? Math.min(passportPxH, maxCellH) : maxCellH;
      const totalGridW = cols * cellW + (cols - 1) * gutterPx;
      const totalGridH = rows * cellH + (rows - 1) * gutterPx;
      const offsetX = marginPx + Math.max(0, (usableW - totalGridW) / 2);
      const offsetY = marginPx + Math.max(0, (usableH - totalGridH) / 2);

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
          const x = offsetX + c * (cellW + gutterPx);
          const y = offsetY + r * (cellH + gutterPx);

            if (resolvedCropRect && resolvedCropRect.srcW > 0 && resolvedCropRect.srcH > 0) {
            let { srcX, srcY, srcW, srcH } = resolvedCropRect;
            const targetW = cellW;
            const targetH = cellH;
            const destAspect = targetW / targetH;
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
              const drawX = x + (cellW - targetW) / 2;
              const drawY = y + (cellH - targetH) / 2;
              ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, targetW, targetH);
            } else {
              const scaleDest = Math.min(targetW / srcW, targetH / srcH);
              const drawW = srcW * scaleDest;
              const drawH = srcH * scaleDest;
              const destX = x + (cellW - drawW) / 2;
              const destY = y + (cellH - drawH) / 2;
              ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, drawW, drawH);
            }
          } else {
            // when no cropRect, respect passport target box if present
            const tW = cellW;
            const tH = cellH;
            if (scaleMode === 'cover') {
              const scale = Math.max(tW / imgW, tH / imgH);
              const drawW = imgW * scale;
              const drawH = imgH * scale;
              const dx = x + (cellW - tW) / 2 + (tW - drawW) / 2;
              const dy = y + (cellH - tH) / 2 + (tH - drawH) / 2;
              ctx.drawImage(img, dx, dy, drawW, drawH);
            } else {
              const scale = Math.min(tW / imgW, tH / imgH);
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
            <Button variant="outlined" onClick={() => onBack && onBack()}>Back</Button>
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

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="photo-size-label">Photo size</InputLabel>
              <Select
                labelId="photo-size-label"
                value={resolvedPassport.size}
                label="Photo size"
                onChange={(e) => handlePassportSizeSelection(e.target.value)}
              >
                {Object.entries(PASSPORT_SIZE_OPTIONS).map(([key, option]) => (
                  <MenuItem key={key} value={key}>
                    {option.label}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Width (mm)"
                type="number"
                size="small"
                value={passportWidthInput}
                onChange={(e) => handlePassportWidthChange(e.target.value)}
                inputProps={{ step: 0.1, min: 1 }}
                fullWidth
              />
              <TextField
                label="Height (mm)"
                type="number"
                size="small"
                value={passportHeightInput}
                onChange={(e) => handlePassportHeightChange(e.target.value)}
                inputProps={{ step: 0.1, min: 1 }}
                fullWidth
              />
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

              {/* Visual indicator of selected passport size within preview */}
              {resolvedPassport && (
                <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ width: `${resolvedPassport.widthMm}mm`, height: `${resolvedPassport.heightMm}mm`, border: '1px dashed rgba(0,0,0,0.45)', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 0 }} />
                </Box>
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
