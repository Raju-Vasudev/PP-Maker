import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
// Using Material Symbols (loaded from index.html) instead of @mui icons

function CloudUploadIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.35 10.04A7.492 7.492 0 0012 4a7.5 7.5 0 00-7.35 6.04A4.5 4.5 0 007.5 21h9a4.5 4.5 0 002.85-10.96zM13 13v4h-2v-4H8l4-4 4 4h-3z" />
    </svg>
  );
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

type UploadImageProps = {
  onUploaded?: (url: string) => void;
  onCropChange?: (rect: { srcX: number; srcY: number; srcW: number; srcH: number; imgW: number; imgH: number } | null) => void;
  onNext?: () => void;
  // visual border preview props
  cellBorderEnabled?: boolean;
  cellBorderMm?: number;
  cellBorderStyle?: 'solid' | 'dashed';
  cellBorderColor?: string;
  // initial values to restore when returning from preview
  initialUploadedUrl?: string | null;
  initialCropRect?: { srcX: number; srcY: number; srcW: number; srcH: number; imgW: number; imgH: number } | null;
};

export default function UploadImage({ onUploaded, onCropChange, onNext, cellBorderEnabled = false, cellBorderMm = 0.35, cellBorderStyle = 'dashed', cellBorderColor = '#000', initialUploadedUrl = null, initialCropRect = null }: UploadImageProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  
  // Cropper state
  const cropCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [cropViewportW] = useState<number>(300);
  const [cropAspectW] = useState<number>(35); // passport width mm
  const [cropAspectH] = useState<number>(45); // passport height mm
  const cropViewportH = Math.round(cropViewportW * (cropAspectH / cropAspectW));
  const [cropScale, setCropScale] = useState<number>(1);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggingRef = React.useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  function validateFile(file: File) {
    if (!file) return "No file provided";
    if (!/image\/(png|jpeg|jpg)/.test(file.type)) return "Please upload a JPG or PNG image file.";
    if (file.size > MAX_SIZE) return "File is larger than 10MB.";
    return null;
  }

  function handleFile(file?: File) {
    setError(null);
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }

    setProcessing(true);

    // create in-memory image and preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // load image into an HTMLImageElement for further processing (in-memory)
    loadImageFromFile(url)
      .then((img) => {
        setLoadedImage(img);
        if (onUploaded) onUploaded(url);
      })
      .catch((e) => {
        console.error(e);
        setError('Failed to load image');
      })
      .finally(() => {
        // simulate short processing time for UX
        window.setTimeout(() => setProcessing(false), 600);
      });
  }

  function loadImageFromFile(objectUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (ev) => reject(new Error('Image load error'));
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;
    });
  }

  // If we have an initial uploaded URL (coming back from preview), load it into the cropper
  React.useEffect(() => {
    if (!initialUploadedUrl) return;
    // if preview already present and matches, skip
    if (previewUrl === initialUploadedUrl && loadedImage) return;
    setPreviewUrl(initialUploadedUrl);
    loadImageFromFile(initialUploadedUrl)
      .then((img) => {
        setLoadedImage(img);
      })
      .catch((e) => {
        console.error('Failed to restore image', e);
      });
  }, [initialUploadedUrl]);

  // Initialize crop state whenever a new image is loaded
  React.useEffect(() => {
    if (!loadedImage) return;
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;
    const ratioImg = imgW / imgH;
    const ratioView = cropViewportW / cropViewportH;

    let baseW: number;
    let baseH: number;
    if (ratioImg > ratioView) {
      baseH = cropViewportH;
      baseW = Math.round(baseH * ratioImg);
    } else {
      baseW = cropViewportW;
      baseH = Math.round(baseW / ratioImg);
    }

    // Try to restore prior crop if provided
    const initialAppliedRef = (UploadImage as any).__initialAppliedRef || { current: false };
    if (!initialAppliedRef.current && initialCropRect && initialUploadedUrl) {
      try {
        const src = initialCropRect;
        const drawW = (cropViewportW * imgW) / src.srcW;
        const drawH = (cropViewportH * imgH) / src.srcH;
        const scale = drawW / baseW;
        const offsetX = - (src.srcX / imgW) * drawW;
        const offsetY = - (src.srcY / imgH) * drawH;
        setCropScale(scale);
        setCropOffset({ x: offsetX, y: offsetY });
        drawCropCanvas(loadedImage, scale, { x: offsetX, y: offsetY });
        if (onCropChange) onCropChange({ ...src, imgW, imgH });
        initialAppliedRef.current = true;
        (UploadImage as any).__initialAppliedRef = initialAppliedRef;
        return;
      } catch (e) {
        // fallthrough to default fit
      }
    }

    // fallback: center image and fit
    setCropScale(1);
    setCropOffset({ x: (cropViewportW - baseW) / 2, y: (cropViewportH - baseH) / 2 });
    drawCropCanvas(loadedImage, 1, { x: (cropViewportW - baseW) / 2, y: (cropViewportH - baseH) / 2 });
    const rect = computeCropSourceRect();
    if (onCropChange) onCropChange(rect ? { ...rect, imgW, imgH } : null);
  }, [loadedImage]);

  function drawCropCanvas(img: HTMLImageElement, scale: number, offset: { x: number; y: number }) {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    canvas.width = cropViewportW;
    canvas.height = cropViewportH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // clear and white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const ratioImg = imgW / imgH;
    const ratioView = canvas.width / canvas.height;

    let baseW: number;
    let baseH: number;
    if (ratioImg > ratioView) {
      baseH = canvas.height;
      baseW = Math.round(baseH * ratioImg);
    } else {
      baseW = canvas.width;
      baseH = Math.round(baseW / ratioImg);
    }

    const drawW = baseW * scale;
    const drawH = baseH * scale;

    ctx.drawImage(img, offset.x, offset.y, drawW, drawH);

    // overlay guide border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // optional border preview (simulate border width in mm mapped to viewport px)
    if (cellBorderEnabled && cellBorderMm && cellBorderMm > 0) {
      const pxPerMm = cropViewportW / cropAspectW; // viewport width corresponds to cropAspectW mm
      const borderPx = Math.max(1, cellBorderMm * pxPerMm);
      ctx.save();
      ctx.strokeStyle = cellBorderColor || '#000';
      ctx.lineWidth = borderPx;
      if (cellBorderStyle === 'dashed') ctx.setLineDash([Math.max(2, borderPx * 2), Math.max(2, borderPx * 2)]);
      else ctx.setLineDash([]);
      const half = ctx.lineWidth / 2;
      ctx.strokeRect(half, half, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
      ctx.restore();
    }
  }

  // Mouse / touch handlers for crop pan
  function onCropMouseDown(e: React.MouseEvent) {
    draggingRef.current.active = true;
    draggingRef.current.startX = e.clientX;
    draggingRef.current.startY = e.clientY;
    draggingRef.current.origX = cropOffset.x;
    draggingRef.current.origY = cropOffset.y;
    window.addEventListener('mousemove', onCropMouseMove);
    window.addEventListener('mouseup', onCropMouseUp);
  }

  function onCropMouseMove(e: MouseEvent) {
    if (!draggingRef.current.active) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    const newOffset = { x: draggingRef.current.origX + dx, y: draggingRef.current.origY + dy };
    setCropOffset(newOffset);
    if (loadedImage) drawCropCanvas(loadedImage, cropScale, newOffset);
    if (onCropChange && loadedImage) {
      const rect = computeCropSourceRect();
      if (rect) onCropChange({ ...rect, imgW: loadedImage.naturalWidth, imgH: loadedImage.naturalHeight });
    }
  }

  function onCropMouseUp() {
    draggingRef.current.active = false;
    window.removeEventListener('mousemove', onCropMouseMove);
    window.removeEventListener('mouseup', onCropMouseUp);
  }

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onCropMouseMove);
      window.removeEventListener('mouseup', onCropMouseUp);
    };
  }, []);

  function onCropWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY / 500; // smooth
    const newScale = Math.max(0.2, cropScale + delta);
    setCropScale(newScale);
    if (loadedImage) drawCropCanvas(loadedImage, newScale, cropOffset);
    if (onCropChange && loadedImage) {
      const rect = computeCropSourceRect();
      if (rect) onCropChange({ ...rect, imgW: loadedImage.naturalWidth, imgH: loadedImage.naturalHeight });
    }
  }

  // Compute source rectangle (in natural image pixels) represented by crop viewport
  function computeCropSourceRect(): { srcX: number; srcY: number; srcW: number; srcH: number } | null {
    if (!loadedImage) return null;
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;

    // determine base draw size used in drawCropCanvas
    const ratioImg = imgW / imgH;
    const ratioView = cropViewportW / cropViewportH;
    let baseW: number;
    let baseH: number;
    if (ratioImg > ratioView) {
      baseH = cropViewportH;
      baseW = Math.round(baseH * ratioImg);
    } else {
      baseW = cropViewportW;
      baseH = Math.round(baseW / ratioImg);
    }

    const drawW = baseW * cropScale;
    const drawH = baseH * cropScale;

    // The offset is where the image top-left is drawn inside the viewport (in viewport px)
    const offsetX = cropOffset.x;
    const offsetY = cropOffset.y;

    // portion of the drawn image that maps to viewport corresponds to viewportWidth/drawW fraction of the natural image
    const srcW = (cropViewportW / drawW) * imgW;
    const srcH = (cropViewportH / drawH) * imgH;
    const srcX = (-offsetX / drawW) * imgW;
    const srcY = (-offsetY / drawH) * imgH;

    // clamp
    const clampedSrcX = Math.max(0, Math.min(imgW - srcW, srcX));
    const clampedSrcY = Math.max(0, Math.min(imgH - srcH, srcY));

    return { srcX: clampedSrcX, srcY: clampedSrcY, srcW, srcH };
  }

  

  

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    handleFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)' }}>
        <Container maxWidth="lg" sx={{ px: 2 }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                <CloudUploadIcon size={20} />
              </Avatar>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
                Passport Photo Generator
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>gpp_good</span>
              <Typography variant="caption">Privacy First: No Data Uploaded</Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 900 }}>
              Upload your photo
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Drag and drop your image here, or browse to select. We'll help you crop it perfectly.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            onDrop={onDrop}
            onDragOver={onDragOver}
            sx={{ p: 6, textAlign: 'center', position: 'relative' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 64, height: 64 }}>
                <CloudUploadIcon size={32} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Drop image here</Typography>
              <Typography color="text.secondary">Supports JPG, PNG up to 10MB</Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<span className="material-symbols-outlined">folder_open</span>}
                sx={{ mt: 2, minWidth: 160 }}
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </Button>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                action={
                  <IconButton color="inherit" size="small" onClick={() => setError(null)}>
                    <span className="material-symbols-outlined">close</span>
                  </IconButton>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span className="material-symbols-outlined">error</span>
                  <Box>
                    <Typography variant="subtitle2">Invalid File</Typography>
                    <Typography variant="caption">{error}</Typography>
                  </Box>
                </Box>
              </Alert>
            )}

            <input
              ref={inputRef}
              accept="image/png, image/jpeg"
              aria-label="Upload photo"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              type="file"
              onChange={onInputChange}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <CloudUploadIcon size={48} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{processing ? 'Processing your photo...' : 'Idle'}</Typography>
              <Typography color="text.secondary">{processing ? 'Detecting face boundaries & removing background' : 'Ready to accept an image'}</Typography>

              {processing && <LinearProgress sx={{ width: '100%', mt: 2 }} />}

              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Crop & position (use mouse drag + wheel)</Typography>
                  <canvas
                    ref={cropCanvasRef}
                    width={cropViewportW}
                    height={cropViewportH}
                    onMouseDown={onCropMouseDown}
                    onWheel={onCropWheel}
                    style={{ display: 'block', marginTop: 8, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)', cursor: 'grab' }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption">Zoom</Typography>
                    <input
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.01}
                      value={cropScale}
                      onChange={(e) => {
                        const s = Number(e.target.value);
                        setCropScale(s);
                        if (loadedImage) {
                          drawCropCanvas(loadedImage, s, cropOffset);
                          const rect = computeCropSourceRect();
                          if (onCropChange && rect) onCropChange({ ...rect, imgW: loadedImage.naturalWidth, imgH: loadedImage.naturalHeight });
                        }
                      }}
                      style={{ width: 180 }}
                    />
                    <Button size="small" onClick={() => {
                      setCropScale(1);
                      setCropOffset({ x: 0, y: 0 });
                      if (loadedImage) {
                        drawCropCanvas(loadedImage, 1, { x: 0, y: 0 });
                        const rect = computeCropSourceRect();
                        if (onCropChange && rect) onCropChange({ ...rect, imgW: loadedImage.naturalWidth, imgH: loadedImage.naturalHeight });
                      }
                    }}>Reset</Button>
                  </Box>
                </Box>
              )}

                {/* Next button to move to Print Preview after user positions/zooms the crop */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (onNext) onNext();
                    }}
                    disabled={!previewUrl}
                  >
                    Next: Preview & Print
                  </Button>
                </Box>

              
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ color: 'rgba(0,0,0,0.54)' }}>lock</span>
            <Typography variant="body2">We process everything in your browser. Your photos never leave your device.</Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
