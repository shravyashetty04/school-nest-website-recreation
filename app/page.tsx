'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Database,
  Headset,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'

const studentImage = '/student-hero.png'
const libraryImage = '/school-library.png'

function Logo() {
  return (
    <a href="#top" className="logo" aria-label="SchoolNest home">
      <span className="logo-mark" aria-hidden="true"><span /><span /></span>
      <span><strong>SchoolNest</strong><small>Schools Today. Brighter Tomorrows.</small></span>
    </a>
  )
}

function Button({ children, outline = false, href }: { children: React.ReactNode; outline?: boolean; href?: string }) {
  const content = <>{children}<ArrowRight size={16} /></>;
  if (href) {
    return <Link href={href} className={`button ${outline ? 'button-outline' : ''}`}>{content}</Link>;
  }
  return <button className={`button ${outline ? 'button-outline' : ''}`}>{content}</button>;
}

const features = [
  { icon: UserPlus, color: 'green', title: 'Student Management', text: 'Manage student records, admissions, and profiles with ease.' },
  { icon: CalendarDays, color: 'teal', title: 'Attendance Tracking', text: 'Track attendance in real-time with automated reports and insights.' },
  { icon: BookOpen, color: 'orange', title: 'Exams & Reports', text: 'Create exams, generate reports, and analyze performance.' },
  { icon: Database, color: 'yellow', title: 'Fee Management', text: 'Manage fees, invoices, and payments seamlessly.' },
  { icon: Clock3, color: 'blue', title: 'Timetable Management', text: 'Create and manage class schedules with ease.' },
  { icon: Users, color: 'purple', title: 'Parent Portal', text: 'Keep parents informed with real-time updates and communication.' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main id="top" className="site-shell">
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <a className="active" href="#top" onClick={() => setMenuOpen(false)}>Home</a><a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#resources" onClick={() => setMenuOpen(false)}>Resources <ChevronDown size={12} /></a>
          </nav>
          <div className="nav-actions"><Search size={18} /><Link href="/login" className="login">Log in</Link><Button href="/signup">Get Started</Button></div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy reveal"><p className="eyebrow">A SMARTER WAY TO RUN SCHOOLS</p><h1>Empowering<br />Education<br />for a <em>Brighter</em><br />Tomorrow</h1><p className="hero-text">A complete school management system to simplify daily operations, enhance learning experiences, and build stronger school communities.</p><div className="hero-buttons"><Button href="/signup">Get Started</Button><Button outline>Request a Demo</Button></div><div className="trust-row"><span><Zap /><b>Easy to Use</b><small>Get started in minutes</small></span><span><ShieldCheck /><b>Secure & Reliable</b><small>Your data is always safe</small></span><span><Users /><b>Dedicated Support</b><small>We&apos;re here to help</small></span></div></div>
        <div className="hero-image-wrap"><img src={studentImage} alt="Student smiling outside school" /><div className="hero-card"><i></i><strong>More Than<br />a School System</strong><small>SIMPLIFY &bull; MANAGE &bull; GROW</small></div></div>
      </section>

      <section className="stats"><div className="container stats-grid"><div><Building2 /><span><b>500+</b><small>Schools Trust Us</small></span></div><div><Users /><span><b>1 Lakh+</b><small>Students Managed</small></span></div><div><BarChart3 /><span><b>99.9%</b><small>Uptime & Security</small></span></div><div><Headset className="headset" /><span><b>24/7</b><small>Dedicated Support</small></span></div></div></section>

      <section id="features" className="section features-section"><div className="container features-layout"><div className="section-intro reveal"><p className="eyebrow">FEATURES</p><h2>Everything<br />Your School <strong className="highlight">Needs</strong></h2><p>Powerful modules designed to simplify school operations and enhance learning experiences.</p><a className="text-link" href="#solutions">Explore All Features <ArrowRight size={16} /></a><div className="handwriting">Smarter Schools<br/>Brighter Futures</div></div><div className="feature-grid">{features.map(({ icon: Icon, color, title, text }) => <article className="feature-item reveal" key={title}><div className={`feature-icon ${color}`}><Icon /></div><div className="feature-content"><h3>{title}</h3><p>{text}</p></div><div className="feature-arrow"><ArrowRight size={14} /></div></article>)}</div></div></section>

      <section id="about" className="about">
        <div className="about-image-wrap">
          <div className="about-image-inner">
            <img src={libraryImage} alt="Bright school library interior" />
            <div className="about-image-card">
              <div className="card-icon"><BookOpen size={20} /></div>
              <div className="card-text">
                <strong>Nurturing<br />Potential Today</strong>
                <span>for a Brighter Tomorrow</span>
              </div>
            </div>
          </div>
          <div className="about-swoop"></div>
        </div>
        <div className="about-content">
          <div className="about-main">
            <p className="eyebrow">ABOUT US <span className="line"></span></p>
            <h2>Technology for<br />Meaningful Education</h2>
            <p className="about-desc">At <strong>SchoolNest</strong>, we believe in the power of education to create a better tomorrow. Our mission is to provide schools with modern, simple and effective tools to manage, grow and inspire.</p>
            <Button>Our Story</Button>
            
            <div className="about-features">
              <div>
                <span className="icon"><Sprout size={18}/></span>
                <h4>Our Mission</h4>
                <p>Simplify school operations<br />for a better tomorrow.</p>
              </div>
              <div>
                <span className="icon"><Users size={18}/></span>
                <h4>Our Vision</h4>
                <p>Smarter schools,<br />brighter futures.</p>
              </div>
              <div>
                <span className="icon"><Heart size={18}/></span>
                <h4>Our Values</h4>
                <p>People, progress<br />and possibilities.</p>
              </div>
            </div>
          </div>
          
          <div className="about-stats-wrap">
            <svg className="leaf-decor" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 -20 C60 0, 40 40, 50 80 C80 90, 100 70, 100 50 Z" fill="#ebf0e6" />
              <path d="M50 0 C20 10, -10 40, 0 80 C30 100, 50 90, 50 50 Z" fill="#ebf0e6" opacity="0.6" />
            </svg>
            <div className="about-stats">
              <b>500+<small>Schools Across India</small></b>
              <b>1,00,000+<small>Students Impacted</small></b>
              <b>98%<small>Customer Satisfaction</small></b>
            </div>
            <div className="about-stats-footer">
              <span className="line"></span>
              <p>BUILDING<br/>BRIGHTER TOMORROWS</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="testimonial-layout">
          <div className="testimonial-intro">
            <p className="eyebrow">TESTIMONIALS <span className="line"></span></p>
            <h2>Trusted by Educators<br /><span style={{color: '#0f3f2d'}}>Loved by Communities</span></h2>
            <p className="intro-desc">Hear from school leaders, teachers and parents<br />who are building brighter futures with SchoolNest.</p>
            <div className="arrow-buttons">
              <button aria-label="Previous" className="btn-prev"><ArrowLeft size={16} strokeWidth={2} /></button>
              <button aria-label="Next" className="btn-next"><ArrowRight size={16} strokeWidth={2} /></button>
            </div>
          </div>
          <div className="testimonial-content">
            <span className="quote-mark">“</span>
            <p className="quote-text">&quot;SchoolNest has transformed the way we<br/>manage our school. It&apos;s simple, efficient and<br/>incredibly user-friendly. Our teachers, parents<br/>and students all love it!&quot;</p>
            <div className="person">
              <img src="/placeholder-user.jpg" alt="Dr. Meera Kulkarni" className="avatar-img" />
              <div>
                <b>Dr. Meera Kulkarni</b>
                <small>Principal, Greenwood International School</small>
              </div>
            </div>
            <div className="testimonial-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          <div className="testimonial-image">
            <img src="/placeholder.jpg" alt="Testimonial" />
            <div className="handwriting">Brighter<br />Schools<br />Happier<br />Communities<span className="swoosh"></span></div>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-layout">
          <div className="footer-content">
            <div className="footer-title">
              <p className="eyebrow">JOIN THOUSANDS OF SCHOOLS <span className="line"></span></p>
              <h2>Let&apos;s Build a Brighter<br />Future <em>Together.</em></h2>
            </div>
            <div className="footer-middle">
              <p>Start your journey with SchoolNest today and<br />experience a smarter, simpler way to manage<br />your school.</p>
              <div className="footer-buttons">
                <Button href="/signup">Get Started</Button>
                <Button outline>Contact Sales</Button>
              </div>
            </div>
            <div className="footer-mark">
              <span className="icon"><Sparkles size={16} /></span>
              <p>Education<br />Today.<br />Brighter<br />Tomorrows.</p>
            </div>
          </div>
          <div className="footer-image">
            <img src="/placeholder.jpg" alt="School Campus" />
          </div>
        </div>
      </footer>
    </main>
  )
}
