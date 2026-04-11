'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHero from "@/components/shared/PageHero";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <PageHero title="Support" subtitle="Need help? We're here for you" />
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Quick Help</h2>
              <div className="space-y-3">
                <Link href="/track" className="block p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>📍 Track My Booking</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Check your booking status with your tracking number</p>
                </Link>
                <Link href="/faqs" className="block p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>❓ FAQs</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Find answers to common questions</p>
                </Link>
                <Link href="/contact" className="block p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>📧 Contact Us</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Get in touch directly</p>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Emergency Contact</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>For urgent matters, call us at:</p>
              <p className="text-lg font-bold mt-2" style={{ color: 'var(--primary)' }}>+44 20 7946 0958</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Available 24/7</p>
            </div>
          </div>
          <div className="rounded-2xl border p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Submit a Support Request</h2>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="font-bold" style={{ color: 'var(--foreground)' }}>Request submitted!</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>We&apos;ll respond within 4 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 rounded-xl border text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <input type="email" placeholder="Your Email" required className="w-full px-4 py-3 rounded-xl border text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <input type="text" placeholder="Tracking Number (if applicable)" className="w-full px-4 py-3 rounded-xl border text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <select required className="w-full px-4 py-3 rounded-xl border text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option value="">Select Issue Type</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="parking">Parking Issue</option>
                  <option value="other">Other</option>
                </select>
                <textarea rows={4} placeholder="Describe your issue" required className="w-full px-4 py-3 rounded-xl border text-sm resize-none" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <button type="submit" className="w-full py-3 rounded-xl text-white font-bold" style={{ background: 'var(--primary)' }}>Submit Request</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
