import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, cfg, ADMIN_EMAIL } from './firebase';

const useUser = () => { const [u,s]=useState(undefined); useEffect(()=>onAuthStateChanged(auth,s),[]); return u; };
const slugify = t => t.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const parseList = (str, sep='\n') => (str||'').split(sep).map(s=>s.trim()).filter(Boolean);

function usePortfolioData(c) {
  return {
    skills:       parseList(c.skills, ','),
    languages:    parseList(c.languages, ','),
    interests:    parseList(c.interests, ','),
    certs:        parseList(c.certifications),
    achievements: parseList(c.achievements),
    projects:     parseList(c.projects).map(l => { const [title,url,tech,...r]=l.split('|'); return {title:title?.trim(),url:url?.trim(),tech:tech?.trim(),desc:r.join('|').trim()}; }),
    experience:   parseList(c.experience).map(l => { const [rc,years,...r]=l.split('|'); const [role,company]=(rc||'').split('@').map(s=>s?.trim()); return {role,company,years:years?.trim(),desc:r.join('|').trim()}; }),
    education:    parseList(c.education).map(l => { const [ds,years,...r]=l.split('|'); const [degree,school]=(ds||'').split('@').map(s=>s?.trim()); return {degree,school,years:years?.trim(),desc:r.join('|').trim()}; }),
    references:   parseList(c.references).map(l => { const [name,role,contact]=l.split('|'); return {name:name?.trim(),role:role?.trim(),contact:contact?.trim()}; }),
    socials:      [{key:'linkedin',icon:'LI',label:'LinkedIn'},{key:'github',icon:'GH',label:'GitHub'},{key:'twitter',icon:'TW',label:'Twitter'},{key:'website',icon:'🌐',label:'Website'}].filter(s=>c[s.key]),
  };
}

/* ══════════════════════════════════
   TEMPLATE 1 — CLARITY
══════════════════════════════════ */
function TemplateClarity({ c }) {
  const d = usePortfolioData(c);
  return (
    <div className="t1">
      <aside className="t1-side">
        <div className="t1-photo-wrap">
          {c.photo ? <img src={c.photo} alt={c.name} className="t1-photo"/> : <div className="t1-photo t1-ph">{(c.name||'P')[0]}</div>}
        </div>
        <div className="t1-name">{c.name}</div>
        <div className="t1-role-badge">{c.title}</div>
        {c.location && <div className="t1-loc">📍 {c.location}</div>}
        <div className="t1-section"><div className="t1-label">Contact</div>
          {c.email&&<a href={`mailto:${c.email}`} className="t1-row"><span className="t1-ico">✉</span>{c.email}</a>}
          {c.phone&&<a href={`tel:${c.phone}`} className="t1-row"><span className="t1-ico">📞</span>{c.phone}</a>}
          {c.dob&&<div className="t1-row"><span className="t1-ico">🎂</span>{c.dob}</div>}
          {c.nationality&&<div className="t1-row"><span className="t1-ico">🌏</span>{c.nationality}</div>}
        </div>
        {d.socials.length>0&&<div className="t1-section"><div className="t1-label">Links</div>
          {d.socials.map(s=><a key={s.key} href={c[s.key]} target="_blank" rel="noreferrer" className="t1-social"><span className="t1-social-icon">{s.icon}</span>{s.label}</a>)}
        </div>}
        {d.skills.length>0&&<div className="t1-section"><div className="t1-label">Skills</div>
          <div className="t1-skill-grid">{d.skills.map((s,i)=><div key={i} className="t1-skill-chip">{s}</div>)}</div>
        </div>}
        {d.languages.length>0&&<div className="t1-section"><div className="t1-label">Languages</div>
          <div className="t1-lang-list">{d.languages.map((l,i)=><div key={i} className="t1-lang-item"><span className="t1-lang-dot"/>{l}</div>)}</div>
        </div>}
        {d.interests.length>0&&<div className="t1-section"><div className="t1-label">Interests</div>
          <div className="t1-interest-list">{d.interests.map((x,i)=><span key={i} className="t1-interest">{x}</span>)}</div>
        </div>}
        {c.cvUrl&&<a href={c.cvUrl} target="_blank" rel="noreferrer" className="t1-cv-btn">⬇ Download CV</a>}
      </aside>
      <main className="t1-main">
        {c.about&&<section className="t1-block"><div className="t1-block-head"><span className="t1-block-icon">👋</span><h2>About Me</h2></div><p className="t1-about-text">{c.about}</p></section>}
        {d.experience.length>0&&<section className="t1-block"><div className="t1-block-head"><span className="t1-block-icon">💼</span><h2>Work Experience</h2></div>
          <div className="t1-tl">{d.experience.map((e,i)=><div key={i} className="t1-tl-item">
            <div className="t1-tl-left"><div className="t1-tl-dot"/>{i<d.experience.length-1&&<div className="t1-tl-line"/>}</div>
            <div className="t1-tl-body">
              <div className="t1-tl-header"><span className="t1-tl-role">{e.role}</span>{e.years&&<span className="t1-tl-year">{e.years}</span>}</div>
              {e.company&&<div className="t1-tl-company">🏢 {e.company}</div>}
              {e.desc&&<p className="t1-tl-desc">{e.desc}</p>}
            </div>
          </div>)}</div>
        </section>}
        {d.education.length>0&&<section className="t1-block"><div className="t1-block-head"><span className="t1-block-icon">🎓</span><h2>Education</h2></div>
          <div className="t1-tl">{d.education.map((e,i)=><div key={i} className="t1-tl-item">
            <div className="t1-tl-left"><div className="t1-tl-dot edu"/>{i<d.education.length-1&&<div className="t1-tl-line"/>}</div>
            <div className="t1-tl-body">
              <div className="t1-tl-header"><span className="t1-tl-role">{e.degree}</span>{e.years&&<span className="t1-tl-year">{e.years}</span>}</div>
              {e.school&&<div className="t1-tl-company">🏫 {e.school}</div>}
              {e.desc&&<p className="t1-tl-desc">{e.desc}</p>}
            </div>
          </div>)}</div>
        </section>}
        {d.projects.length>0&&<section className="t1-block"><div className="t1-block-head"><span className="t1-block-icon">🚀</span><h2>Projects</h2></div>
          <div className="t1-proj-grid">{d.projects.map((p,i)=><div key={i} className="t1-proj-card">
            <div className="t1-proj-top"><span className="t1-proj-name">{p.title}</span>{p.url&&<a href={p.url} target="_blank" rel="noreferrer" className="t1-proj-link">↗ View</a>}</div>
            {p.tech&&<div className="t1-proj-tech">{p.tech.split(',').map((t,j)=><span key={j} className="t1-tech-tag">{t.trim()}</span>)}</div>}
            {p.desc&&<p className="t1-proj-desc">{p.desc}</p>}
          </div>)}</div>
        </section>}
        {(d.certs.length>0||d.achievements.length>0)&&<section className="t1-block">
          {d.certs.length>0&&<><div className="t1-block-head"><span className="t1-block-icon">🏆</span><h2>Certifications</h2></div>
            <div className="t1-award-list">{d.certs.map((x,i)=><div key={i} className="t1-award-item"><span className="t1-award-icon">🏆</span><span>{x}</span></div>)}</div></>}
          {d.achievements.length>0&&<><div className="t1-block-head" style={{marginTop:20}}><span className="t1-block-icon">⭐</span><h2>Achievements</h2></div>
            <div className="t1-award-list">{d.achievements.map((x,i)=><div key={i} className="t1-award-item"><span className="t1-award-icon">⭐</span><span>{x}</span></div>)}</div></>}
        </section>}
        {d.references.length>0&&<section className="t1-block"><div className="t1-block-head"><span className="t1-block-icon">🤝</span><h2>References</h2></div>
          <div className="t1-ref-grid">{d.references.map((r,i)=><div key={i} className="t1-ref-card"><div className="t1-ref-name">{r.name}</div>{r.role&&<div className="t1-ref-role">{r.role}</div>}{r.contact&&<div className="t1-ref-contact">{r.contact}</div>}</div>)}</div>
        </section>}
      </main>
      <div className="t1-footer">© {new Date().getFullYear()} {c.name} · Portfolio Engine</div>
    </div>
  );
}

/* ══════════════════════════════════
   TEMPLATE 2 — BOLD
══════════════════════════════════ */
function TemplateBold({ c }) {
  const d = usePortfolioData(c);
  return (
    <div className="t2">
      <div className="t2-hero">
        <div className="t2-hero-bg"/>
        {c.photo?<img src={c.photo} className="t2-photo" alt={c.name}/>:<div className="t2-photo t2-ph">{(c.name||'P')[0]}</div>}
        <div className="t2-hero-info">
          <h1 className="t2-name">{c.name}</h1>
          <div className="t2-title">{c.title}</div>
          {c.location&&<div className="t2-loc">📍 {c.location}</div>}
          {c.bio&&<p className="t2-bio">{c.bio}</p>}
          <div className="t2-contacts">
            {c.email&&<a href={`mailto:${c.email}`} className="t2-contact-pill">✉ {c.email}</a>}
            {c.phone&&<a href={`tel:${c.phone}`} className="t2-contact-pill">📞 {c.phone}</a>}
            {d.socials.map(s=><a key={s.key} href={c[s.key]} target="_blank" rel="noreferrer" className="t2-contact-pill">{s.label} ↗</a>)}
            {c.cvUrl&&<a href={c.cvUrl} target="_blank" rel="noreferrer" className="t2-contact-pill t2-cv-pill">⬇ CV</a>}
          </div>
        </div>
      </div>
      <div className="t2-body">
        {c.about&&<div className="t2-section t2-about-section"><div className="t2-section-icon">👋</div><div><h3 className="t2-sh">About Me</h3><p className="t2-about-p">{c.about}</p></div></div>}
        {d.skills.length>0&&<div className="t2-section"><div className="t2-section-icon">⚡</div><div style={{flex:1}}><h3 className="t2-sh">Skills</h3><div className="t2-skill-chips">{d.skills.map((s,i)=><span key={i} className="t2-skill-chip">{s}</span>)}</div></div></div>}
        <div className="t2-two-col">
          {d.experience.length>0&&<div className="t2-card"><h3 className="t2-ch"><span>💼</span> Experience</h3>
            {d.experience.map((e,i)=><div key={i} className="t2-entry">
              <div className="t2-entry-head"><b>{e.role}</b>{e.years&&<span className="t2-year-badge">{e.years}</span>}</div>
              {e.company&&<div className="t2-entry-sub">{e.company}</div>}
              {e.desc&&<p className="t2-entry-desc">{e.desc}</p>}
            </div>)}
          </div>}
          {d.education.length>0&&<div className="t2-card"><h3 className="t2-ch"><span>🎓</span> Education</h3>
            {d.education.map((e,i)=><div key={i} className="t2-entry">
              <div className="t2-entry-head"><b>{e.degree}</b>{e.years&&<span className="t2-year-badge">{e.years}</span>}</div>
              {e.school&&<div className="t2-entry-sub">{e.school}</div>}
              {e.desc&&<p className="t2-entry-desc">{e.desc}</p>}
            </div>)}
          </div>}
        </div>
        {d.projects.length>0&&<div className="t2-card t2-full"><h3 className="t2-ch"><span>🚀</span> Projects</h3>
          <div className="t2-proj-grid">{d.projects.map((p,i)=><div key={i} className="t2-proj">
            <div className="t2-proj-header"><span className="t2-proj-name">{p.title}</span>{p.url&&<a href={p.url} target="_blank" rel="noreferrer" className="t2-proj-btn">↗ View</a>}</div>
            {p.tech&&<div className="t2-proj-tech">{p.tech}</div>}
            {p.desc&&<p className="t2-entry-desc">{p.desc}</p>}
          </div>)}</div>
        </div>}
        <div className="t2-two-col">
          {d.certs.length>0&&<div className="t2-card"><h3 className="t2-ch"><span>🏆</span> Certifications</h3>
            {d.certs.map((x,i)=><div key={i} className="t2-bullet-item">🏆 {x}</div>)}
          </div>}
          {(d.languages.length>0||d.interests.length>0)&&<div className="t2-card">
            {d.languages.length>0&&<><h3 className="t2-ch"><span>💬</span> Languages</h3><div className="t2-skill-chips" style={{marginBottom:14}}>{d.languages.map((l,i)=><span key={i} className="t2-skill-chip">{l}</span>)}</div></>}
            {d.interests.length>0&&<><h3 className="t2-ch"><span>🎯</span> Interests</h3><div className="t2-skill-chips">{d.interests.map((x,i)=><span key={i} className="t2-skill-chip">{x}</span>)}</div></>}
          </div>}
        </div>
        {d.references.length>0&&<div className="t2-card t2-full"><h3 className="t2-ch"><span>🤝</span> References</h3>
          <div className="t2-ref-grid">{d.references.map((r,i)=><div key={i} className="t2-ref"><b>{r.name}</b>{r.role&&<div className="t2-entry-sub">{r.role}</div>}{r.contact&&<div className="t2-proj-tech">{r.contact}</div>}</div>)}</div>
        </div>}
      </div>
      <div className="t2-footer">© {new Date().getFullYear()} {c.name}</div>
    </div>
  );
}

/* ══════════════════════════════════
   TEMPLATE 3 — MINIMAL
══════════════════════════════════ */
function TemplateMinimal({ c }) {
  const d = usePortfolioData(c);
  return (
    <div className="t3">
      <header className="t3-header">
        {c.photo?<img src={c.photo} className="t3-photo" alt={c.name}/>:<div className="t3-photo t3-ph">{(c.name||'P')[0]}</div>}
        <div className="t3-header-info">
          <h1 className="t3-name">{c.name}</h1>
          <div className="t3-title">{c.title}</div>
          <div className="t3-meta">
            {c.location&&<span>📍 {c.location}</span>}
            {c.email&&<a href={`mailto:${c.email}`}>✉ {c.email}</a>}
            {c.phone&&<a href={`tel:${c.phone}`}>📞 {c.phone}</a>}
            {d.socials.map(s=><a key={s.key} href={c[s.key]} target="_blank" rel="noreferrer">{s.label}</a>)}
          </div>
          {c.cvUrl&&<a href={c.cvUrl} target="_blank" rel="noreferrer" className="t3-cv-btn">⬇ Download CV</a>}
        </div>
      </header>
      <div className="t3-body">
        {c.about&&<div className="t3-sec"><h2 className="t3-h">Profile</h2><p className="t3-about">{c.about}</p></div>}
        {d.skills.length>0&&<div className="t3-sec"><h2 className="t3-h">Skills</h2><div className="t3-chips">{d.skills.map((s,i)=><span key={i} className="t3-chip">{s}</span>)}</div></div>}
        {d.experience.length>0&&<div className="t3-sec"><h2 className="t3-h">Experience</h2>
          {d.experience.map((e,i)=><div key={i} className="t3-item">
            <div className="t3-item-row"><span className="t3-item-title">{e.role}</span>{e.company&&<span className="t3-item-sub">@ {e.company}</span>}{e.years&&<span className="t3-item-yr">{e.years}</span>}</div>
            {e.desc&&<p className="t3-item-desc">{e.desc}</p>}
          </div>)}
        </div>}
        {d.education.length>0&&<div className="t3-sec"><h2 className="t3-h">Education</h2>
          {d.education.map((e,i)=><div key={i} className="t3-item">
            <div className="t3-item-row"><span className="t3-item-title">{e.degree}</span>{e.school&&<span className="t3-item-sub">@ {e.school}</span>}{e.years&&<span className="t3-item-yr">{e.years}</span>}</div>
            {e.desc&&<p className="t3-item-desc">{e.desc}</p>}
          </div>)}
        </div>}
        {d.projects.length>0&&<div className="t3-sec"><h2 className="t3-h">Projects</h2>
          {d.projects.map((p,i)=><div key={i} className="t3-item">
            <div className="t3-item-row"><span className="t3-item-title">{p.title}</span>{p.tech&&<span className="t3-item-sub">{p.tech}</span>}{p.url&&<a href={p.url} target="_blank" rel="noreferrer" className="t3-ext">↗</a>}</div>
            {p.desc&&<p className="t3-item-desc">{p.desc}</p>}
          </div>)}
        </div>}
        <div className="t3-three-col">
          {d.certs.length>0&&<div className="t3-sec"><h2 className="t3-h">Certifications</h2>{d.certs.map((x,i)=><div key={i} className="t3-bullet">— {x}</div>)}</div>}
          {d.languages.length>0&&<div className="t3-sec"><h2 className="t3-h">Languages</h2><div className="t3-chips">{d.languages.map((l,i)=><span key={i} className="t3-chip">{l}</span>)}</div></div>}
          {d.interests.length>0&&<div className="t3-sec"><h2 className="t3-h">Interests</h2><div className="t3-chips">{d.interests.map((x,i)=><span key={i} className="t3-chip">{x}</span>)}</div></div>}
        </div>
        {d.references.length>0&&<div className="t3-sec"><h2 className="t3-h">References</h2>
          <div className="t3-ref-grid">{d.references.map((r,i)=><div key={i} className="t3-ref"><b>{r.name}</b>{r.role&&<div className="t3-item-sub" style={{marginTop:2}}>{r.role}</div>}{r.contact&&<div className="t3-item-yr" style={{marginTop:2}}>{r.contact}</div>}</div>)}</div>
        </div>}
      </div>
      <div className="t3-footer">© {new Date().getFullYear()} {c.name} · Portfolio Engine</div>
    </div>
  );
}

export function Portfolio({ c }) {
  const t = c.template||'clarity';
  if(t==='bold') return <TemplateBold c={c}/>;
  if(t==='minimal') return <TemplateMinimal c={c}/>;
  return <TemplateClarity c={c}/>;
}

/* ══════════════════════════════════
   LOGIN
══════════════════════════════════ */
function Login() {
  const nav=useNavigate(); const [e,setE]=useState(''); const [p,setP]=useState(''); const [err,setErr]=useState(''); const [ld,setLd]=useState(false);
  const go=async()=>{ if(!e||!p){setErr('Enter email and password');return;} setLd(true);setErr('');
    try{ const r=await signInWithEmailAndPassword(auth,e,p); nav(r.user.email===ADMIN_EMAIL?'/admin':'/dashboard'); }
    catch{ setErr('Login failed. Check your credentials.'); } finally{setLd(false);} };
  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-logo">⚡</div>
        <h1>Portfolio Engine</h1>
        <p>Build stunning portfolios for every client — fast, easy, beautiful.</p>
        <div className="login-features">
          {['3 gorgeous templates','Admin panel + client dashboard','Instant preview & publish','Custom domain support','CV & file uploads'].map(f=><div key={f} className="lf-item"><span className="lf-check">✓</span>{f}</div>)}
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-logo">⚡</div>
          <h2>Welcome back</h2><p className="login-sub">Sign in to continue</p>
          <div className="login-form">
            <label>Email Address<input type="email" value={e} onChange={x=>setE(x.target.value)} placeholder="you@example.com" autoFocus/></label>
            <label>Password<input type="password" value={p} onChange={x=>setP(x.target.value)} placeholder="••••••••" onKeyDown={x=>x.key==='Enter'&&go()}/></label>
            <button className="btn p full" onClick={go} disabled={ld}>{ld?<><span className="spin">↻</span> Signing in…</>:'Sign In →'}</button>
            {err&&<div className="login-err">{err}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   CREATE ACCOUNT MODAL
══════════════════════════════════ */
function CreateAccountModal({ client, onDone, onClose }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const create = async () => {
    if (!pw || pw.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (pw !== pw2) { setErr('Passwords do not match'); return; }
    setLoading(true); setErr('');
    try {
      const sec = getAuth(initializeApp(cfg, 'sec' + Date.now()));
      const cr = await createUserWithEmailAndPassword(sec, client.email, pw);
      await onDone(cr.user.uid);
      setDone(true);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        {done ? (
          <div className="modal-success">
            <div className="modal-success-icon">🎉</div>
            <h3>Account Created!</h3>
            <p>Client can now login with:</p>
            <div className="modal-cred"><span>Email:</span><code>{client.email}</code></div>
            <div className="modal-cred"><span>Password:</span><code>{pw}</code></div>
            <div className="modal-hint">Share these credentials with your client to access their dashboard.</div>
            <button className="btn p full" style={{marginTop:16}} onClick={onClose}>Done ✓</button>
          </div>
        ) : (
          <>
            <div className="modal-icon">🔑</div>
            <h3>Create Client Account</h3>
            <p className="modal-sub">This will allow <b>{client.name}</b> to login and view their portfolio dashboard.</p>
            <div className="modal-form">
              <div className="modal-field"><label>Client Email</label><input value={client.email} disabled/></div>
              <div className="modal-field"><label>Set Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min 6 characters"/></div>
              <div className="modal-field"><label>Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Repeat password" onKeyDown={e=>e.key==='Enter'&&create()}/></div>
              {err&&<div className="modal-err">❌ {err}</div>}
              <button className="btn p full" onClick={create} disabled={loading}>
                {loading?<><span className="spin">↻</span> Creating…</>:'🔑 Create Account & Dashboard'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   TEMPLATE PICKER
══════════════════════════════════ */
const TEMPLATES = [
  { id:'clarity', name:'Clarity', desc:'Sidebar layout, CV style', color:'linear-gradient(135deg,#4f46e5,#7c3aed,#db2777)', preview:'◧' },
  { id:'bold',    name:'Bold',    desc:'Dark hero + cards',         color:'linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)', preview:'⬛' },
  { id:'minimal', name:'Minimal', desc:'Clean white, print-ready',  color:'linear-gradient(135deg,#374151,#6b7280)',          preview:'☐' },
];
function TemplatePicker({ selected, onChange }) {
  return (
    <div className="tp-grid">
      {TEMPLATES.map(t=>(
        <button key={t.id} className={`tp-card${selected===t.id?' sel':''}`} onClick={()=>onChange(t.id)}>
          <div className="tp-preview" style={{background:t.color}}><span className="tp-preview-icon">{t.preview}</span></div>
          <div className="tp-info"><div className="tp-name">{t.name}</div><div className="tp-desc">{t.desc}</div></div>
          {selected===t.id&&<div className="tp-selected-badge">✓ Selected</div>}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   CLIENT FORM
══════════════════════════════════ */
const EMPTY = { name:'',title:'',location:'',dob:'',nationality:'',bio:'',about:'',email:'',phone:'',skills:'',languages:'',interests:'',experience:'',education:'',projects:'',certifications:'',achievements:'',references:'',github:'',linkedin:'',twitter:'',website:'',customDomain:'',photo:'',cvUrl:'',template:'clarity',published:false };

const SECTIONS = [
  {id:'photo',  label:'📷',  name:'Photo'},
  {id:'basic',  label:'👤',  name:'Basic'},
  {id:'about',  label:'📝',  name:'About'},
  {id:'exp',    label:'💼',  name:'Experience'},
  {id:'edu',    label:'🎓',  name:'Education'},
  {id:'proj',   label:'🚀',  name:'Projects'},
  {id:'extra',  label:'🏆',  name:'Extra'},
  {id:'links',  label:'🔗',  name:'Links'},
  {id:'tmpl',   label:'🎨',  name:'Template'},
];

function ClientForm({ f, setF, onSave, onPreview, onBack, onCreateAccount }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDone,    setCvDone]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [active,    setActive]    = useState('photo');
  const refs = useRef({});
  const set  = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const photoSrc = photoFile ? URL.createObjectURL(photoFile) : f.photo;

  const scrollTo = id => {
    refs.current[id]?.scrollIntoView({ behavior:'smooth', block:'start' });
    setActive(id);
  };

  /* ── CV: upload immediately when file is chosen ── */
  const handleCvPick = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setCvUploading(true); setCvDone(false);
    try {
      const id = f.id || slugify(f.name || 'cv-' + Date.now());
      const storageRef = ref(storage, `cvs/${id}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setF(p => ({ ...p, cvUrl: url }));
      setCvDone(true);
      setTimeout(() => setCvDone(false), 4000);
    } catch(err) {
      alert('CV upload failed: ' + err.message);
    } finally {
      setCvUploading(false);
      e.target.value = '';   // reset so same file can be picked again
    }
  };

  /* ── Save: only text + optional photo (CV already uploaded) ── */
  const handleSave = async (extra = {}) => {
    setSaving(true); setMsg('');
    try {
      if (photoFile) setMsg('uploading-photo');
      else           setMsg('saving');
      await onSave(photoFile, null, extra);   // cvFile = null (done separately)
      setPhotoFile(null);
      setMsg('success');
    } catch(e) {
      setMsg('error:' + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3500);
    }
  };

  return (
    <div className="cf-page">
      <div className="cf-topbar">
        <button className="cf-back" onClick={onBack}>← Back</button>
        <div className="cf-title">
          {photoSrc?<img src={photoSrc} className="cf-mini-photo" alt=""/>:<div className="cf-mini-photo cf-mini-ph">{(f.name||'?')[0]}</div>}
          <div><div style={{fontWeight:700,fontSize:15}}>{f.name||'New Client'}</div>{f.title&&<div style={{fontSize:12,color:'var(--mu)'}}>{f.title}</div>}</div>
          {f.id&&<span className={`badge ${f.published?'live':'draft'}`}>{f.published?'● Live':'○ Draft'}</span>}
        </div>
        <div className="row">
          <button className="btn" onClick={onPreview}>👁 Preview</button>
          <button className="btn p" onClick={()=>handleSave()} disabled={saving}>
            {saving
              ? msg==='uploading-photo' ? <><span className="spin">↻</span> Uploading photo…</>
              :                          <><span className="spin">↻</span> Saving…</>
              : '💾 Save'}
          </button>
        </div>
      </div>

      {msg==='success'&&<div className="toast success">✅ Saved successfully!</div>}
      {msg==='saving'&&<div className="toast saving">💾 Saving details…</div>}
      {msg==='uploading-photo'&&<div className="toast saving">📷 Uploading photo…</div>}
      {msg.startsWith('error:')&&<div className="toast error">❌ {msg.replace('error:','')}</div>}

      <div className="cf-layout">
        {/* LEFT NAV */}
        <nav className="cf-nav">
          <div className="cf-nav-label">Sections</div>
          {SECTIONS.map(s=>(
            <button key={s.id} className={`cf-nav-btn${active===s.id?' active':''}`} onClick={()=>scrollTo(s.id)}>
              <span className="cf-nav-icon">{s.label}</span>
              <span className="cf-nav-text">{s.name}</span>
            </button>
          ))}
          <div className="cf-nav-divider"/>
          <div className="cf-nav-label">Actions</div>
          <button className="cf-nav-action p" onClick={()=>handleSave()} disabled={saving}>
            {saving
              ? msg==='uploading-photo'?'📷 Uploading…'
              : msg==='uploading-cv'   ?'📄 Uploading…'
              : '↻ Saving…'
              : '💾 Save'}
          </button>
          <button className="cf-nav-action" onClick={onPreview}>👁 Preview</button>
          {f.id&&<button className={`cf-nav-action ${f.published?'':'pub'}`} onClick={()=>handleSave({published:!f.published})}>{f.published?'📴 Unpublish':'🚀 Publish'}</button>}
          {f.id&&f.email&&<button className="cf-nav-action key" onClick={onCreateAccount}>🔑 Create Login</button>}
          {f.id&&f.published&&<a href={`/p/${f.slug}`} target="_blank" rel="noreferrer" className="cf-nav-action live">● View Live ↗</a>}
        </nav>

        {/* SCROLL CONTENT */}
        <div className="cf-scroll">

          <div className="cf-card" ref={el=>refs.current['photo']=el} id="photo">
            <div className="cf-card-title">📷 Profile Photo</div>
            <div className="cf-photo-zone">
              <div className="cf-photo-preview">{photoSrc?<img src={photoSrc} alt=""/>:<div className="cf-photo-empty">📷</div>}</div>
              <div>
                <label className="btn p" style={{cursor:'pointer'}}>{photoFile?'✓ Photo Selected':'Upload Photo'}<input type="file" accept="image/*" onChange={e=>setPhotoFile(e.target.files[0])} style={{display:'none'}}/></label>
                {photoFile&&<div className="cf-file-name">✓ {photoFile.name}</div>}
                <p className="cf-hint-sm">Square JPG/PNG recommended</p>
              </div>
            </div>
          </div>

          <div className="cf-card" ref={el=>refs.current['basic']=el} id="basic">
            <div className="cf-card-title">👤 Basic Information</div>
            <div className="cf-grid-2">
              <div className="cf-field"><label>Full Name *</label><input value={f.name} onChange={set('name')} placeholder="Jane Doe"/></div>
              <div className="cf-field"><label>Professional Title</label><input value={f.title} onChange={set('title')} placeholder="Full Stack Developer"/></div>
              <div className="cf-field"><label>Email</label><input type="email" value={f.email} onChange={set('email')} placeholder="jane@example.com"/></div>
              <div className="cf-field"><label>Phone</label><input value={f.phone} onChange={set('phone')} placeholder="+94 77 123 4567"/></div>
              <div className="cf-field"><label>Location</label><input value={f.location} onChange={set('location')} placeholder="Colombo, Sri Lanka"/></div>
              <div className="cf-field"><label>Date of Birth</label><input type="date" value={f.dob} onChange={set('dob')}/></div>
              <div className="cf-field"><label>Nationality</label><input value={f.nationality} onChange={set('nationality')} placeholder="Sri Lankan"/></div>
            </div>
            <div className="cf-field" style={{marginTop:10}}><label>Short Bio</label><textarea value={f.bio} onChange={set('bio')} rows={2} placeholder="A brief one-liner shown under your name…"/></div>
          </div>

          <div className="cf-card" ref={el=>refs.current['about']=el} id="about">
            <div className="cf-card-title">📝 About & Skills</div>
            <div className="cf-field"><label>About Me</label><textarea value={f.about} onChange={set('about')} rows={4} placeholder="Write a detailed paragraph about your background, passion and expertise…"/></div>
            <div className="cf-field"><label>Skills <span className="cf-sub">comma separated</span></label><textarea value={f.skills} onChange={set('skills')} rows={2} placeholder="React, Node.js, Firebase, Figma…"/></div>
            <div className="cf-grid-2">
              <div className="cf-field"><label>Languages <span className="cf-sub">comma separated</span></label><input value={f.languages} onChange={set('languages')} placeholder="English, Sinhala, Tamil"/></div>
              <div className="cf-field"><label>Interests <span className="cf-sub">comma separated</span></label><input value={f.interests} onChange={set('interests')} placeholder="Photography, Music, Travel"/></div>
            </div>
          </div>

          <div className="cf-card" ref={el=>refs.current['exp']=el} id="exp">
            <div className="cf-card-title">💼 Work Experience</div>
            <div className="cf-field"><textarea value={f.experience} onChange={set('experience')} rows={6} placeholder={"Senior Dev @ Acme Corp | 2022 - Present | Led React frontend team\nJunior Dev @ StartupXYZ | 2020 - 2022 | Built REST APIs with Node.js"}/></div>
            <div className="cf-hint">Format: <code>Role @ Company | Years | Description</code></div>
          </div>

          <div className="cf-card" ref={el=>refs.current['edu']=el} id="edu">
            <div className="cf-card-title">🎓 Education & CV</div>
            <div className="cf-field"><textarea value={f.education} onChange={set('education')} rows={4} placeholder={"B.Sc. CS @ University of Colombo | 2018 - 2022 | First Class\nDiploma UI/UX @ SLIATE | 2017"}/></div>
            <div className="cf-hint">Format: <code>Degree @ Institution | Years | Notes</code></div>
            <div className="cf-divider"/>
            <div className="cf-card-title" style={{marginBottom:10}}>📄 CV / Resume</div>
            <div className="cf-cv-zone">
              <span style={{fontSize:32}}>📄</span>
              <div style={{flex:1}}>
                {/* Upload button */}
                <label className={`btn p${cvUploading?' disabled':''}`} style={{cursor:cvUploading?'not-allowed':'pointer'}}>
                  {cvUploading
                    ? <><span className="spin">↻</span> Uploading CV…</>
                    : cvDone
                    ? '✅ CV Uploaded!'
                    : f.cvUrl
                    ? '📎 Replace CV'
                    : '📎 Upload CV'}
                  <input type="file" accept=".pdf,.zip,.doc,.docx"
                    onChange={handleCvPick}
                    disabled={cvUploading}
                    style={{display:'none'}}/>
                </label>

                {/* Progress bar while uploading */}
                {cvUploading && (
                  <div className="cv-progress-bar">
                    <div className="cv-progress-fill" style={{animation:'cvprogress 3s ease forwards'}}/>
                  </div>
                )}

                <p className="cf-hint-sm" style={{marginTop:6}}>PDF, ZIP, DOC — uploads immediately</p>
                {f.cvUrl && !cvUploading && (
                  <a href={f.cvUrl} target="_blank" rel="noreferrer" className="cf-view-link">
                    📄 View uploaded CV ↗
                  </a>
                )}
                {cvDone && <div style={{fontSize:12,color:'#16a34a',fontWeight:600,marginTop:4}}>✅ CV saved to Firebase!</div>}
              </div>
            </div>
          </div>

          <div className="cf-card" ref={el=>refs.current['proj']=el} id="proj">
            <div className="cf-card-title">🚀 Projects</div>
            <div className="cf-field"><textarea value={f.projects} onChange={set('projects')} rows={5} placeholder={"Portfolio Engine | https://app.com | React, Firebase | CV generator SaaS\nE-Commerce | https://github.com/… | Node.js | Shopping platform"}/></div>
            <div className="cf-hint">Format: <code>Name | URL | Tech Stack | Description</code></div>
          </div>

          <div className="cf-card" ref={el=>refs.current['extra']=el} id="extra">
            <div className="cf-card-title">🏆 Certifications</div>
            <div className="cf-field"><textarea value={f.certifications} onChange={set('certifications')} rows={3} placeholder={"AWS Certified Developer - 2023\nGoogle Cloud Architect - 2022"}/></div>
            <div className="cf-divider"/>
            <div className="cf-card-title" style={{marginBottom:10}}>⭐ Achievements</div>
            <div className="cf-field"><textarea value={f.achievements} onChange={set('achievements')} rows={3} placeholder={"Best Developer Award - 2023\nHackathon Winner - TechFest 2022"}/></div>
            <div className="cf-divider"/>
            <div className="cf-card-title" style={{marginBottom:10}}>🤝 References</div>
            <div className="cf-field"><textarea value={f.references} onChange={set('references')} rows={3} placeholder={"John Smith | CTO at Acme Corp | john@acme.com\nSarah Lee | Project Manager | +94 77 000 0000"}/><div className="cf-hint">Format: <code>Name | Role | Contact</code></div></div>
          </div>

          <div className="cf-card" ref={el=>refs.current['links']=el} id="links">
            <div className="cf-card-title">🔗 Social Links & Domain</div>
            <div className="cf-grid-2">
              <div className="cf-field"><label>💼 LinkedIn</label><input value={f.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…"/></div>
              <div className="cf-field"><label>🐙 GitHub</label><input value={f.github} onChange={set('github')} placeholder="https://github.com/…"/></div>
              <div className="cf-field"><label>🐦 Twitter/X</label><input value={f.twitter} onChange={set('twitter')} placeholder="https://twitter.com/…"/></div>
              <div className="cf-field"><label>🌐 Website</label><input value={f.website} onChange={set('website')} placeholder="https://janedoe.com"/></div>
            </div>
            <div className="cf-field" style={{marginTop:8}}><label>Custom Domain <span className="cf-sub">optional</span></label><input value={f.customDomain} onChange={set('customDomain')} placeholder="janedoe.com"/></div>
            {f.slug&&<div className="cf-domain-box" style={{marginTop:8}}><span>Live URL:</span><a href={`/p/${f.slug}`} target="_blank" rel="noreferrer">/p/{f.slug}</a></div>}
          </div>

          <div className="cf-card" ref={el=>refs.current['tmpl']=el} id="tmpl">
            <div className="cf-card-title">🎨 Choose Portfolio Template</div>
            <TemplatePicker selected={f.template||'clarity'} onChange={t=>setF(p=>({...p,template:t}))}/>
            <div className="cf-hint" style={{marginTop:14}}>💡 Select a template then click <b>👁 Preview</b> to see it live.</div>
          </div>

          <div className="cf-actions-bar">
            <button className="btn p" onClick={()=>handleSave()} disabled={saving}>
            {saving
              ? msg==='uploading-photo'?<><span className="spin">↻</span> Uploading photo…</>
              :                         <><span className="spin">↻</span> Saving…</>
              : '💾 Save All'}
          </button>
            <button className="btn" onClick={onPreview}>👁 Preview</button>
            {f.id&&<button className="btn pub" onClick={()=>handleSave({published:!f.published})}>{f.published?'📴 Unpublish':'🚀 Publish Live'}</button>}
            {f.id&&f.email&&<button className="btn key-btn" onClick={onCreateAccount}>🔑 Create Client Login</button>}
            {f.id&&f.published&&<a href={`/p/${f.slug}`} target="_blank" rel="noreferrer" className="btn live-btn" style={{textDecoration:'none'}}>● View Live ↗</a>}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   ADMIN ROOT
══════════════════════════════════ */
function Admin() {
  const user=useUser();
  const [list,setList]=useState([]);
  const [f,setF]=useState(null);
  const [view,setView]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all'); // 'all' | 'live' | 'draft'
  const [showAccModal,setShowAccModal]=useState(false);

  const load=async()=>setList((await getDocs(collection(db,'clients'))).docs.map(d=>({id:d.id,...d.data()})));
  useEffect(()=>{if(user)load();},[user]);

  if(user===undefined)return <div className="loading">Loading…</div>;
  if(!user||user.email!==ADMIN_EMAIL)return <Navigate to="/"/>;

  const handleSave=async(photoFile,cvFile,extra={})=>{
    // Deep copy — never mutate f directly
    let d = JSON.parse(JSON.stringify({ ...f, ...extra }));
    const id = d.id || slugify(d.name || 'client-' + Date.now());
    d.slug = id;
    delete d.id;   // Firestore doc id is the key, not a field

    // Upload photo if changed
    if(photoFile){
      const r=ref(storage,`photos/${id}`);
      await uploadBytes(r,photoFile);
      d.photo=await getDownloadURL(r);
    }
    // Upload CV if changed (usually null — CV uploaded separately)
    if(cvFile){
      const r=ref(storage,`cvs/${id}_${cvFile.name}`);
      await uploadBytes(r,cvFile);
      d.cvUrl=await getDownloadURL(r);
    }

    // Write to Firestore (merge keeps existing fields safe)
    await setDoc(doc(db,'clients',id), d, {merge:true});

    // Update local state immediately
    const updated = { ...d, id };
    setF(updated);
    setList(prev=>{
      const idx = prev.findIndex(c=>c.id===id);
      if(idx>=0){ const n=[...prev]; n[idx]=updated; return n; }
      return [...prev, updated];
    });
  };

  const handleAccountCreated=async(uid)=>{ await handleSave(null,null,{uid}); };

  if(f&&view)return(
    <div>
      <div className="preview-bar">
        <button className="preview-back-btn" onClick={()=>setView(false)}>
          <span className="preview-back-arrow">←</span>
          <span>Back to Editor</span>
        </button>
        <div className="preview-bar-center">
          <span className="preview-bar-label">👁 Preview Mode</span>
          <span className="preview-bar-name">{f.name}</span>
          <span className="preview-bar-tmpl">🎨 {f.template||'clarity'}</span>
        </div>
        <div className="preview-bar-actions">
          {f.published
            ? <a className="btn p" href={`/p/${f.slug}`} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>🌐 Open Live ↗</a>
            : <button className="btn" style={{color:'#a5b4fc',borderColor:'rgba(255,255,255,.2)',background:'rgba(255,255,255,.1)'}} onClick={()=>setView(false)}>💾 Save & Publish</button>
          }
        </div>
      </div>
      <Portfolio c={f}/>
    </div>
  );

  if(f)return(
    <>
      {showAccModal&&<CreateAccountModal client={f} onDone={handleAccountCreated} onClose={()=>setShowAccModal(false)}/>}
      <ClientForm f={f} setF={setF} onSave={handleSave} onPreview={()=>setView(true)} onBack={()=>{setF(null);setView(false);}} onCreateAccount={()=>setShowAccModal(true)}/>
    </>
  );

  const live=list.filter(c=>c.published).length;
  const drafts=list.filter(c=>!c.published).length;

  let displayed=list;
  if(filter==='live') displayed=list.filter(c=>c.published);
  if(filter==='draft') displayed=list.filter(c=>!c.published);
  if(search) displayed=displayed.filter(c=>c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase()));

  return(
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">⚡</div>
          <div><h1 className="admin-title">Portfolio Engine</h1><p className="admin-sub">Admin Dashboard</p></div>
        </div>
        <div className="row">
          <button className="btn p" onClick={()=>setF({...EMPTY})}>+ New Client</button>
          <button className="btn" onClick={()=>signOut(auth)}>Logout</button>
        </div>
      </div>

      {/* STATS — clickable */}
      <div className="admin-stats">
        <button className={`admin-stat-card${filter==='all'?' stat-active':''}`} onClick={()=>setFilter('all')} style={{'--c':'#4f46e5','--cl':'#eef2ff'}}>
          <div className="asc-icon" style={{background:'#eef2ff',color:'#4f46e5'}}>👥</div>
          <div><div className="asc-num">{list.length}</div><div className="asc-label">Total Clients</div></div>
          <div className="asc-arrow">→</div>
        </button>
        <button className={`admin-stat-card${filter==='live'?' stat-active':''}`} onClick={()=>setFilter('live')} style={{'--c':'#16a34a','--cl':'#dcfce7'}}>
          <div className="asc-icon" style={{background:'#dcfce7',color:'#16a34a'}}>🌐</div>
          <div><div className="asc-num">{live}</div><div className="asc-label">Live Portfolios</div></div>
          <div className="asc-arrow">→</div>
        </button>
        <button className={`admin-stat-card${filter==='draft'?' stat-active':''}`} onClick={()=>setFilter('draft')} style={{'--c':'#d97706','--cl':'#fef3c7'}}>
          <div className="asc-icon" style={{background:'#fef3c7',color:'#d97706'}}>📝</div>
          <div><div className="asc-num">{drafts}</div><div className="asc-label">Drafts</div></div>
          <div className="asc-arrow">→</div>
        </button>
      </div>

      {/* FILTER TABS + SEARCH */}
      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          {[['all','All'],['live','Live'],['draft','Drafts']].map(([v,l])=>(
            <button key={v} className={`aft-btn${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
        <input className="admin-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search clients…"/>
      </div>

      {/* CLIENT GRID */}
      <div className="admin-grid">
        {displayed.map(c=>(
          <div key={c.id} className="admin-card">
            <div className="admin-card-inner">
              <div className="ac-photo-wrap">
                {c.photo?<img className="ac-photo" src={c.photo} alt=""/>:<div className="ac-photo ac-photo-ph">{(c.name||'?')[0]}</div>}
                <span className={`ac-status-dot ${c.published?'live':'draft'}`}/>
              </div>
              <div className="ac-info">
                <div className="ac-name">{c.name||'Untitled'}</div>
                <div className="ac-role">{c.title||'—'}</div>
                <div className="ac-email">{c.email}</div>
                <div className="ac-meta">
                  <span className={`badge ${c.published?'live':'draft'}`}>{c.published?'● Live':'○ Draft'}</span>
                  <span className="ac-tmpl">🎨 {c.template||'clarity'}</span>
                </div>
              </div>
            </div>
            <div className="ac-actions">
              <button className="btn" onClick={async()=>{
                // Fetch fresh from Firestore before opening editor
                try {
                  const snap = await getDocs(query(collection(db,'clients'), where('slug','==',c.slug)));
                  const fresh = snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : c;
                  setF(fresh);
                } catch(e) {
                  setF(c); // fallback to local
                }
              }}>✏ Edit</button>
              {c.slug&&<a className="btn" href={`/p/${c.slug}`} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>↗ View</a>}
              {!c.uid&&c.email&&<button className="btn key-btn" onClick={()=>{setF(c);setTimeout(()=>setShowAccModal(true),100);}}>🔑</button>}
              <button className="btn d" onClick={async()=>{if(confirm(`Delete ${c.name}?`)){await deleteDoc(doc(db,'clients',c.id));load();}}}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {!displayed.length&&(
        <div className="admin-empty">
          {filter!=='all'?<><div style={{fontSize:48}}>{filter==='live'?'🌐':'📝'}</div><p>No {filter==='live'?'live':'draft'} clients yet.</p><button className="btn" onClick={()=>setFilter('all')}>Show all</button></>
          :<><div style={{fontSize:48}}>📋</div><p>No clients yet.</p><button className="btn p" onClick={()=>setF({...EMPTY})}>+ Add First Client</button></>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   CLIENT DASHBOARD
══════════════════════════════════ */
function Dashboard() {
  const user=useUser(); const [c,setC]=useState(null);
  useEffect(()=>{if(user)getDocs(query(collection(db,'clients'),where('uid','==',user.uid))).then(s=>setC(s.docs[0]?.data()||false));},[user]);
  if(user===undefined)return <div className="loading">Loading…</div>;
  if(!user)return <Navigate to="/"/>;
  if(c===null)return <div className="loading">Loading your portfolio…</div>;
  if(!c)return(
    <div className="db-empty-page">
      <div className="db-empty-card"><div style={{fontSize:52}}>⏳</div><h2>Not Ready Yet</h2><p>Your portfolio is being prepared. Check back soon!</p><button className="btn" onClick={()=>signOut(auth)}>Logout</button></div>
    </div>
  );
  return(
    <div>
      <div className="db-navbar">
        <div className="db-navbar-left">
          <div className="db-nav-photo">{c.photo?<img src={c.photo} alt=""/>:<span>{(c.name||'?')[0]}</span>}</div>
          <div><div className="db-nav-name">{c.name}</div><div className="db-nav-title">{c.title}</div></div>
        </div>
        <div className="row">
          <span className={`badge ${c.published?'live':'draft'} badge-lg`}>{c.published?'● Portfolio Live':'○ Under Review'}</span>
          {c.published&&c.slug&&<a className="btn p" href={`/p/${c.slug}`} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>View Portfolio ↗</a>}
          <button className="btn" onClick={()=>signOut(auth)}>Logout</button>
        </div>
      </div>
      <Portfolio c={c}/>
    </div>
  );
}

/* ══════════════════════════════════
   PUBLIC PAGE
══════════════════════════════════ */
function Public() {
  const {slug}=useParams(); const [c,setC]=useState(null);
  useEffect(()=>{getDocs(query(collection(db,'clients'),where('slug','==',slug),where('published','==',true))).then(s=>setC(s.docs[0]?.data()||false));},[slug]);
  if(c===null)return <div className="loading">Loading…</div>;
  if(!c)return <div className="not-found"><div style={{fontSize:64}}>🔍</div><h2>Not Found</h2><p>This portfolio may not be published yet.</p></div>;
  return <Portfolio c={c}/>;
}

export default function App() {
  return(
    <BrowserRouter><Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/p/:slug" element={<Public/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes></BrowserRouter>
  );
}
