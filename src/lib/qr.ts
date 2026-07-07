import QRCode from 'qrcode'

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 320,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

export function getMenuUrl(slug: string): string {
  return `${window.location.origin}/menu/${slug}`
}

export function getDisplayUrl(slug: string): string {
  return `${window.location.origin}/display/${slug}`
}
