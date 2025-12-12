import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export default function PrintSettings() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Print Layout</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Configure your sheet settings and layout before printing.</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Paper Size</Typography>
        <Select defaultValue="A4" fullWidth size="small" sx={{ mt: 1 }}>
          <MenuItem value="A4">A4 (210 x 297 mm)</MenuItem>
          <MenuItem value="Letter">US Letter (8.5 x 11 in)</MenuItem>
          <MenuItem value="4x6">4 x 6 inch</MenuItem>
        </Select>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Width</Typography>
          <Typography sx={{ fontWeight: 700 }}>600 px</Typography>
        </Paper>
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Height</Typography>
          <Typography sx={{ fontWeight: 700 }}>900 px</Typography>
        </Paper>
      </Stack>

      <Paper sx={{ bgcolor: 'info.lighter', p: 1.5, borderRadius: 1, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Typography sx={{ fontSize: 18, color: 'primary.main' }}>i</Typography>
          <Typography variant="body2">Auto-fit enabled. 8 photos fit on A4 with 5mm margins.</Typography>
        </Stack>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Copies</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Button variant="outlined" size="small">-</Button>
          <TextField size="small" defaultValue={8} sx={{ width: 80, textAlign: 'center' }} />
          <Button variant="outlined" size="small">+</Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained" color="primary">Print Sheet</Button>
        <Button fullWidth variant="outlined">Save Image</Button>
      </Stack>
    </Box>
  );
}
