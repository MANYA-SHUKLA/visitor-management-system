'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

export default function ScanPage() {
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<{ action: string; visit: Visit } | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  async function processToken(token: string) {
    setError('');
    setResult(null);
    try {
      const res = await api.post('/visits/scan', { qrToken: token.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startCamera() {
    setError('');
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded) => {
          await scanner.stop();
          scannerRef.current = null;
          setScanning(false);
          await processToken(decoded);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Camera access failed. Paste the QR token below.'
      );
    }
  }

  async function stopCamera() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl font-semibold sm:text-2xl">Scan visitor QR</h2>

      <div className="grid w-full gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div id="qr-reader" className="w-full overflow-hidden rounded-lg [&_video]:!w-full" />

        <div className="mt-4 flex flex-wrap gap-2">
          {!scanning ? (
            <button
              type="button"
              onClick={startCamera}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Start camera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Stop camera
            </button>
          )}
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            processToken(manualToken);
          }}
        >
          <label className="block text-sm font-medium">Or paste QR token</label>
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
            placeholder="JWT token from QR"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Submit token
          </button>
        </form>
      </div>

      <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-6">
          <p className="font-semibold text-green-900">
            {result.action === 'entry' ? 'Checked in' : 'Checked out'}
          </p>
          <p className="mt-2 text-sm">{result.visit.visitorName}</p>
          <div className="mt-2">
            <StatusBadge status={result.visit.status} />
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
