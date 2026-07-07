import { useEffect, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Maximize2, MonitorPlay, QrCode } from 'lucide-react'
import type { Restaurant } from '../../types'
import { DISPLAY_LAYOUTS, LAYOUT_VARIANTS, displayLayoutUrl } from '../../lib/display-layouts'
import { generateQrDataUrl, getMenuUrl } from '../../lib/qr'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface QrDisplayPanelProps {
  restaurant: Restaurant
}

export function QrDisplayPanel({ restaurant }: QrDisplayPanelProps) {
  const menuUrl = getMenuUrl(restaurant.slug)
  const defaultLayout = restaurant.branding.displayLayout ?? 'grid'
  const displayWithLayout = displayLayoutUrl(restaurant.slug, defaultLayout)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<'menu' | 'display' | null>(null)

  useEffect(() => {
    void generateQrDataUrl(menuUrl).then(setQrDataUrl)
  }, [menuUrl])

  async function copy(text: string, which: 'menu' | 'display') {
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadQr() {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `${restaurant.slug}-menu-qr.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR menu link
            </CardTitle>
            <CardDescription>Customers scan this to open your mobile menu on their phone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Menu URL</Label>
              <div className="mt-1 flex gap-2">
                <Input readOnly value={menuUrl} />
                <Button type="button" variant="outline" onClick={() => copy(menuUrl, 'menu')}>
                  {copied === 'menu' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <img src={qrDataUrl} alt="Menu QR code" className="h-48 w-48 rounded-lg bg-white p-2" />
                <Button type="button" variant="outline" onClick={downloadQr}>
                  <Download className="h-4 w-4" />
                  Download QR PNG
                </Button>
              </div>
            )}
            <Button type="button" variant="outline" asChild>
              <a href={menuUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open menu preview
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Monitor display board
            </CardTitle>
            <CardDescription>
              Full-screen menu for tablets &amp; TVs. Tap items for nutrition &amp; reviews. Auto-refreshes every 30s.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Display URL (default layout)</Label>
              <div className="mt-1 flex gap-2">
                <Input readOnly value={displayWithLayout} />
                <Button type="button" variant="outline" onClick={() => copy(displayWithLayout, 'display')}>
                  {copied === 'display' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="button" asChild style={{ backgroundColor: restaurant.branding.primaryColor }}>
              <a href={displayWithLayout} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open display board
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="h-5 w-5" />
            Display layout options
          </CardTitle>
          <CardDescription>
            Choose a layout style for your in-store monitor. Set the default in Branding, or open any preview below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DISPLAY_LAYOUTS.map((layout) => (
              <div
                key={layout.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-bold text-slate-900">{layout.name}</p>
                <p className="mt-1 text-xs text-slate-500">{layout.description}</p>
                {layout.id === defaultLayout && (
                  <span className="mt-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                    Default
                  </span>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {LAYOUT_VARIANTS[layout.id].map((v) => (
                    <a
                      key={v.id}
                      href={displayLayoutUrl(restaurant.slug, layout.id, v.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                      title={v.description}
                    >
                      {v.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
