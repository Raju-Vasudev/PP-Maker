import { useState } from 'react'
import './App.css'
import UploadImage from './Components/UploadImage'
import PrintLayoutPreview from './Pages/PrintLayoutPreview'

function App() {
  const [page, setPage] = useState<'upload' | 'preview'>('upload');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<{ srcX: number; srcY: number; srcW: number; srcH: number; imgW: number; imgH: number } | null>(null);
  // border settings lifted to App so they persist between Upload and Preview
  const [cellBorderEnabled, setCellBorderEnabled] = useState<boolean>(false);
  const [cellBorderMm, setCellBorderMm] = useState<number>(0.35);
  const [cellBorderStyle, setCellBorderStyle] = useState<'solid' | 'dashed'>('dashed');
  const [cellBorderColor, setCellBorderColor] = useState<string>('#000000');

  return (
    <div>
      {page === 'upload' ? (
        <UploadImage
          onUploaded={(u: string) => { setUploadedUrl(u); }}
          onCropChange={(rect) => setCropRect(rect)}
          onNext={() => setPage('preview')}
          cellBorderEnabled={cellBorderEnabled}
          cellBorderMm={cellBorderMm}
          cellBorderStyle={cellBorderStyle}
          cellBorderColor={cellBorderColor}
          initialUploadedUrl={uploadedUrl}
          initialCropRect={cropRect}
        />
      ) : (
        <PrintLayoutPreview
          uploadedUrl={uploadedUrl}
          cropRect={cropRect}
          onBack={() => setPage('upload')}
          cellBorderEnabled={cellBorderEnabled}
          setCellBorderEnabled={setCellBorderEnabled}
          cellBorderMm={cellBorderMm}
          setCellBorderMm={setCellBorderMm}
          cellBorderStyle={cellBorderStyle}
          setCellBorderStyle={setCellBorderStyle}
          cellBorderColor={cellBorderColor}
          setCellBorderColor={setCellBorderColor}
        />
      )}
    </div>
  );
}

export default App
