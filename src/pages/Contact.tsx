import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const INTEREST_OPTIONS = [
  'Human Capital Management (HRMIS)',
  'Financial & Banking Systems',
  'Public Sector & Governance',
  'Enterprise Operations (ERP)',
  'IT Infrastructure & Security',
  'Compliance & Reporting',
];

const emptyForm = {
  fullName: '',
  email: '',
  organization: '',
  interest: INTEREST_OPTIONS[0],
  message: '',
  website: '', // honeypot — real users never fill this
};

type FormState = typeof emptyForm;

export default function Contact() {
  usePageMeta(
    'Contact Us',
    'Contact Matrix Solutions Company Limited in Kanifing, The Gambia. Request a demo or consultation for enterprise software, banking systems, and IT services.'
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setForm(emptyForm);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message
          : 'We could not send your message right now. Please try again, or email us at info@matrixgambia.com.'
      );
    }
  };

  const inputClass =
    'w-full px-5 py-4 rounded-lg border border-slate-200 focus:border-matrix-blue-primary focus:ring-4 focus:ring-matrix-blue-primary/10 outline-none transition-all font-medium';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white">
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="text-matrix-blue-primary text-sm font-extrabold uppercase tracking-[0.2em]">
                  Contact Us
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-matrix-navy leading-tight">
                  Let’s build your <span className="text-matrix-blue-primary">enterprise future</span>.
                </h1>
                <p className="text-xl text-matrix-slate leading-relaxed font-medium">
                  Whether you’re a government ministry looking for transparency or a financial institution seeking security, our team is ready to consult on your digital transformation.
                </p>
              </div>

              <div className="space-y-10">
                <div className="flex gap-8 group">
                  <div className="w-16 h-16 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary shrink-0 group-hover:bg-matrix-blue-primary group-hover:text-white transition-all duration-300">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-matrix-navy mb-2">Our Office</h2>
                    <p className="text-matrix-slate font-medium leading-relaxed">
                      Alhagie Kebba Conteh Memorial Plaza<br />
                      Kanifing East Layout - KMC<br />
                      P.O. BOX 699, Banjul, The Gambia
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 group">
                  <div className="w-16 h-16 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary shrink-0 group-hover:bg-matrix-blue-primary group-hover:text-white transition-all duration-300">
                    <Phone size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-matrix-navy mb-2">Call Us</h2>
                    <p className="text-matrix-slate font-medium leading-relaxed">
                      (+220) 7101931 | 2893652 | 3888551<br />
                      Mon-Fri: 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 group">
                  <div className="w-16 h-16 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary shrink-0 group-hover:bg-matrix-blue-primary group-hover:text-white transition-all duration-300">
                    <Mail size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-matrix-navy mb-2">Email Us</h2>
                    <p className="text-matrix-slate font-medium leading-relaxed">
                      <a href="mailto:info@matrixgambia.com" className="hover:text-matrix-blue-primary transition-colors">info@matrixgambia.com</a><br />
                      <a href="mailto:sales@matrixgambia.com" className="hover:text-matrix-blue-primary transition-colors">sales@matrixgambia.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white p-12 rounded-2xl shadow-2xl shadow-matrix-navy/5 border border-slate-100"
            >
              {status === 'success' ? (
                <div className="text-center py-20 space-y-8">
                  <div className="w-24 h-24 bg-matrix-blue-primary/10 text-matrix-blue-primary rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-extrabold text-matrix-navy">Message Sent!</h3>
                    <p className="text-matrix-slate font-medium">Thank you for reaching out. A Matrix consultant will contact you within 24 hours.</p>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-secondary w-full"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8" noValidate={false}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="contact-name" className="block text-sm font-extrabold text-matrix-navy uppercase tracking-widest">Full Name</label>
                      <input
                        id="contact-name"
                        name="fullName"
                        type="text"
                        required
                        maxLength={120}
                        autoComplete="name"
                        value={form.fullName}
                        onChange={update('fullName')}
                        className={inputClass}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contact-email" className="block text-sm font-extrabold text-matrix-navy uppercase tracking-widest">Email Address</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        maxLength={200}
                        autoComplete="email"
                        value={form.email}
                        onChange={update('email')}
                        className={inputClass}
                        placeholder="john@organization.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="contact-org" className="block text-sm font-extrabold text-matrix-navy uppercase tracking-widest">Organization</label>
                      <input
                        id="contact-org"
                        name="organization"
                        type="text"
                        required
                        maxLength={200}
                        autoComplete="organization"
                        value={form.organization}
                        onChange={update('organization')}
                        className={inputClass}
                        placeholder="Ministry of Finance"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contact-interest" className="block text-sm font-extrabold text-matrix-navy uppercase tracking-widest">Interest</label>
                      <select
                        id="contact-interest"
                        name="interest"
                        value={form.interest}
                        onChange={update('interest')}
                        className={`${inputClass} appearance-none bg-white`}
                      >
                        {INTEREST_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="contact-message" className="block text-sm font-extrabold text-matrix-navy uppercase tracking-widest">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      maxLength={5000}
                      rows={5}
                      value={form.message}
                      onChange={update('message')}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your project requirements..."
                    />
                  </div>

                  {/* Honeypot field — hidden from humans, catches naive bots */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={update('website')}
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-primary w-full text-lg py-5 flex items-center justify-center gap-3"
                  >
                    {status === 'sending' ? (
                      <>
                        Sending...
                        <Loader2 size={20} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
