export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #faf9f8 0%, #f0ebff 100%)' }}>
      <nav style={{ position: 'fixed', top: 0, width: '100%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb', zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>Recall AI</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/auth" style={{ padding: '8px 16px', color: '#666', textDecoration: 'none' }}>Sign In</a>
            <a href="/auth" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Get Started</a>
          </div>
        </div>
      </nav>

      <section style={{ paddingTop: '128px', paddingBottom: '80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f1f1f', marginBottom: '24px' }}>Never Forget What Matters</h1>
          <p style={{ fontSize: '20px', color: '#666', marginBottom: '32px' }}>Capture commitments from email, calendar, voice, and files. Smart AI reminds you exactly when you need it.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth" style={{ padding: '12px 32px', background: '#4f46e5', color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Start Free</a>
            <a href="#features" style={{ padding: '12px 32px', border: '2px solid #e5e7eb', color: '#1f1f1f', borderRadius: '8px', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Learn More</a>
          </div>
        </div>
      </section>

      <section id="features" style={{ paddingTop: '80px', paddingBottom: '80px', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '60px' }}>Capture from Anywhere</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { icon: '📧', title: 'Email', desc: 'Auto-sync Gmail. Extract commitments.' },
              { icon: '📅', title: 'Calendar', desc: 'Extract action items from events.' },
              { icon: '🎤', title: 'Voice', desc: 'Speak naturally. AI transcribes.' },
              { icon: '📄', title: 'Files', desc: 'Upload PDFs and images.' },
              { icon: '✏️', title: 'Quick Capture', desc: 'Type naturally. AI understands.' },
              { icon: '🔗', title: 'Unified Inbox', desc: 'All sources in one pipeline.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '24px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: '80px', paddingBottom: '80px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '32px' }}>AI-Powered Memory Assistant</h2>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>Smart extraction, grounded Q&A, and timely reminders. Never miss a commitment again.</p>
          <a href="/auth" style={{ padding: '12px 32px', background: '#4f46e5', color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: '500', textDecoration: 'none', display: 'inline-block' }}>Get Started Free</a>
        </div>
      </section>

      <footer style={{ background: '#1f2937', color: '#9ca3af', padding: '40px', textAlign: 'center', fontSize: '14px' }}>
        <p>© 2026 Recall AI. An AI-powered memory assistant.</p>
      </footer>
    </div>
  );
}
