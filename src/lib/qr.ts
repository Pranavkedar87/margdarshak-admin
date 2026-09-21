import QRCode from 'qrcode';

export interface QROptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates high-resolution PNG data URL (minimum 1000x1000 px) for the payload.
 */
export async function generateQrPng(
  payload: string,
  width: number = 1024
): Promise<string> {
  return await QRCode.toDataURL(payload, {
    width,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1E293B',
      light: '#FFFFFF'
    }
  });
}

/**
 * Generates an SVG string representation for vector printing.
 */
export async function generateQrSvg(
  payload: string
): Promise<string> {
  return await QRCode.toString(payload, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1E293B',
      light: '#FFFFFF'
    }
  });
}

/**
 * Triggers a browser file download of a Data URL (PNG)
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers a browser file download of an SVG string
 */
export function downloadSvgString(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
