'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { isValidPhone, PHONE_LENGTH, sanitizePhone } from '@/lib/phone';
import type { User } from '@/types';

export default function RegisterVisitorPage() {
  const router = useRouter();
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [apartment, setApartment] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const res = await api.get('/residents');
      return res.data.residents as User[];
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!isValidPhone(visitorPhone)) {
      setError(`Phone must be exactly ${PHONE_LENGTH} digits`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/visits', {
        visitorName,
        visitorPhone,
        purpose,
        apartment,
        expectedAt: expectedAt || undefined,
      });
      router.push(`/guard/visits/${res.data.visit._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold sm:text-2xl">Register visitor</h2>
      <p className="mt-1 text-sm text-slate-600">
        The resident will receive an approval request.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid w-full gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 md:grid-cols-2"
      >
        <div>
          <label className="block text-sm font-medium">Visitor name</label>
          <input
            required
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            required
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={PHONE_LENGTH}
            value={visitorPhone}
            onChange={(e) => setVisitorPhone(sanitizePhone(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="10-digit mobile number"
            title={`Enter a ${PHONE_LENGTH}-digit phone number`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Purpose</label>
          <input
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Delivery, guest, maintenance…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Resident flat number</label>
          <select
            required
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select apartment</option>
            {residents?.map((r) => (
              <option key={r._id} value={r.apartment}>
                {r.apartment} — {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Expected time (optional)</label>
          <input
            type="datetime-local"
            value={expectedAt}
            onChange={(e) => setExpectedAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !isValidPhone(visitorPhone)}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 md:col-span-2"
        >
          {loading ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>
    </div>
  );
}
