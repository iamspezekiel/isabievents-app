'use client';

/**
 * TicketQr — renders a REAL, scannable QR code for a ticket code.
 *
 * Why this component exists: the attendee dashboard used to render a Lucide
 * `<QrCode />` *icon* inside the "View Ticket" dialog. An icon encodes nothing,
 * so the gate/staff and vendor scanners never decoded a payload and every scan
 * came back as "Invalid". Every place that shows an attendee's QR must use this
 * component instead so the camera has a real payload to read.
 *
 * The payload is the raw ticket code (e.g. `TKT-8CHARSXX-1`) — exactly what
 * `POST /api/tickets/validate` expects in `body.code`.
 *
 * Notes:
 *  - Rendered client-side only (canvas-backed encoder), so it is safe with SSR.
 *  - `data-ticket-qr` marks the element for the A4 print stylesheet, which
 *    scales the code up so it stays scannable on paper.
 *  - The white background + quiet zone (`margin`) are deliberate: scanners need
 *    contrast and breathing room around the modules.
 */
import React, {useEffect, useState} from 'react';
import QRCode from 'qrcode';
import {QrCode as QrCodeIcon} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface TicketQrProps {
  /** The ticket code to encode (the value the gate scanner looks up). */
  value?: string;
  /** Rendered size in CSS pixels — the code is always square. */
  size?: number;
  /** Quiet-zone width in modules. Keep >= 1 so cameras can lock on. */
  margin?: number;
  className?: string;
}

export function TicketQr({value = '', size = 256, margin = 2, className}: TicketQrProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const text = String(value || '').trim();

    if (!text) {
      setDataUrl('');
      setFailed(false);
      return;
    }

    setFailed(false);
    QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin,
      // Encode at 2x so the code stays crisp on retina screens and in print.
      width: size * 2,
      color: {dark: '#000000', light: '#FFFFFF'},
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.warn('[ticket-qr] failed to encode ticket code:', err);
        if (!cancelled) {
          setFailed(true);
          setDataUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, size, margin]);

  if (!String(value || '').trim() || failed) {
    return (
      <div
        role="img"
        aria-label="Ticket QR code unavailable"
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-white text-black/40',
          className
        )}
        style={{width: size, height: size}}
      >
        <QrCodeIcon className="h-1/3 w-1/3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">QR unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`QR code for ticket ${value}`}
      width={size}
      height={size}
      data-ticket-qr="true"
      className={cn('block bg-white', className)}
      style={{width: size, height: size}}
    />
  );
}
