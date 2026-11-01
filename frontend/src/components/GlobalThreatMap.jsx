import React, { useState, useEffect } from 'react';
import {
  Globe,
  Radio,
  ShieldAlert,
  Crosshair,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  Flame,
  Filter
} from 'lucide-react';

// Live Global Threat Hotspots Telemetry
const THREAT_HOTSPOTS = [
  {
    id: 'ru',
    country: 'Russia',
    city: 'Moscow Region',
    code: 'RU',
    x: 580,
    y: 110,
    threatLevel: 'Critical',
    threatScore: 96,
    attackVolume: '1,840',
    volumeNum: 1840,
    type: 'Origin Hub',
    category: 'APT & Ransomware Cartels',
    actors: ['APT29 (Cozy Bear)', 'Sandworm', 'Turla', 'LockBit Cartel'],
    vectors: ['Living-off-the-Land (LotL)', 'Wiper Malware', 'Cloud Token Hijacking'],
    targets: ['US Defense', 'EU Energy Grids', 'Ukrainian Critical Infra'],
    color: '#f43f5e'
  },
  {
    id: 'cn',
    country: 'China',
    city: 'Beijing / Shanghai Hub',
    code: 'CN',
    x: 720,
    y: 175,
    threatLevel: 'Critical',
    threatScore: 94,
    attackVolume: '2,150',
    volumeNum: 2150,
    type: 'Origin Hub',
    category: 'Critical Infrastructure & Edge Infiltration',
    actors: ['Volt Typhoon', 'Salt Typhoon', 'APT41 (Brass Typhoon)', 'Flax Typhoon'],
    vectors: ['Edge Appliance Zero-Days', 'Cisco / Fortinet Exploits', 'Web Shells'],
    targets: ['US Ports & Power', 'Global Telecommunications', 'Semiconductors'],
    color: '#f43f5e'
  },
  {
    id: 'us',
    country: 'United States',
    city: 'DC / Silicon Valley / NY',
    code: 'US',
    x: 210,
    y: 165,
    threatLevel: 'High Target',
    threatScore: 90,
    attackVolume: '3,890',
    volumeNum: 3890,
    type: 'Target Hub',
    category: 'Primary Inbound Attack Target',
    actors: ['Targeted by 28+ Nation-State Actors'],
    vectors: ['DDoS Floods', 'Spear-Phishing', 'Supply Chain Infiltration'],
    targets: ['Defense Industrial Base', 'Financial Clearing', 'Cloud Hyperscalers'],
    color: '#00e5ff'
  },
  {
    id: 'kp',
    country: 'North Korea',
    city: 'Pyongyang',
    code: 'KP',
    x: 780,
    y: 165,
    threatLevel: 'Critical',
    threatScore: 91,
    attackVolume: '740',
    volumeNum: 740,
    type: 'Origin Hub',
    category: 'Crypto Heists & Weapon Espionage',
    actors: ['Lazarus Group', 'Kimsuky', 'Andariel', 'ScarCruft'],
    vectors: ['Trojanized Open Source Software', 'DeFi Protocol Exploits', 'LinkedIn Lures'],
    targets: ['Cryptocurrency Exchanges', 'Aerospace Engineering', 'Defense Contractors'],
    color: '#f43f5e'
  },
  {
    id: 'ir',
    country: 'Iran',
    city: 'Tehran Corridor',
    code: 'IR',
    x: 590,
    y: 195,
    threatLevel: 'High',
    threatScore: 88,
    attackVolume: '680',
    volumeNum: 680,
    type: 'Origin Hub',
    category: 'OT Sabotage & Influence Warfare',
    actors: ['Peach Sandstorm (APT33)', 'MuddyWater', 'Cotton Sandstorm'],
    vectors: ['SCADA / PLC Probes', 'Password Spraying', 'Wiper Deployment'],
    targets: ['Water & Wastewater Utilities', 'Maritime Transport', 'Government Portals'],
    color: '#f97316'
  },
  {
    id: 'ua',
    country: 'Ukraine',
    city: 'Kyiv Area',
    code: 'UA',
    x: 535,
    y: 145,
    threatLevel: 'Active War Target',
    threatScore: 95,
    attackVolume: '1,670',
    volumeNum: 1670,
    type: 'Target Hub',
    category: 'Hybrid Cyber-Kinetic Conflict Zone',
    actors: ['Targeted by Russian GRU & FSB Units'],
    vectors: ['HermeticWiper', 'CaddyWiper', 'Satellite Link Jamming'],
    targets: ['Electrical Substations', 'Border Telecoms', 'Banking Systems'],
    color: '#f43f5e'
  },
  {
    id: 'de',
    country: 'Germany & Western EU',
    city: 'Frankfurt / Berlin',
    code: 'DE',
    x: 495,
    y: 140,
    threatLevel: 'High Target',
    threatScore: 82,
    attackVolume: '1,420',
    volumeNum: 1420,
    type: 'Target Hub',
    category: 'Industrial Espionage & C2 Transit',
    actors: ['Targeted by Cozy Bear, LockBit, BlackCat'],
    vectors: ['Double Extortion Ransomware', 'VPN Gateways', 'Supply Chain Leaks'],
    targets: ['Automotive R&D', 'Renewable Energy', 'Logistics Hubs'],
    color: '#38bdf8'
  },
  {
    id: 'in',
    country: 'India',
    city: 'Bengaluru / Mumbai',
    code: 'IN',
    x: 665,
    y: 220,
    threatLevel: 'High Target',
    threatScore: 85,
    attackVolume: '1,930',
    volumeNum: 1930,
    type: 'Target Hub',
    category: 'Rapidly Growing FinTech & Infrastructure Target',
    actors: ['Targeted by RedFoxtrot, SideCopy, Lazarus'],
    vectors: ['Mobile Banking Trojans', 'Cloud API Misconfigurations', 'DDoS Storms'],
    targets: ['UPI & Digital Payments', 'Power Transmission', 'Aerospace'],
    color: '#00e5ff'
  },
  {
    id: 'br',
    country: 'Brazil',
    city: 'São Paulo Cyber Hub',
    code: 'BR',
    x: 320,
    y: 300,
    threatLevel: 'Medium-High',
    threatScore: 78,
    attackVolume: '820',
    volumeNum: 820,
    type: 'Origin Hub',
    category: 'Financial Banking Malware Cartels',
    actors: ['Grandoreiro Cartel', 'Guildma', 'Mekotio Syndicate'],
    vectors: ['Overlay Banking Trojans', 'Instant Payment Fraud', 'Phishing Kits'],
    targets: ['Global Retail Banks', 'E-commerce Gateways', 'Credit Unions'],
    color: '#eab308'
  },
  {
    id: 'nl',
    country: 'Netherlands',
    city: 'Amsterdam Transit Hub',
    code: 'NL',
    x: 475,
    y: 135,
    threatLevel: 'Medium',
    threatScore: 74,
    attackVolume: '960',
    volumeNum: 960,
    type: 'Transit / C2 Hub',
    category: 'Bulletproof Hosting & Fast-Flux C2 Infrastructure',
    actors: ['Host for multi-national cybercrime syndicates'],
    vectors: ['Fast-Flux DNS Networks', 'Tor Exit Node Relays', 'Command-and-Control Servers'],
    targets: ['Global Hosting Networks', 'Data Center Backbones'],
    color: '#eab308'
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    city: 'London Financial Core',
    code: 'GB',
    x: 460,
    y: 130,
    threatLevel: 'High Target',
    threatScore: 84,
    attackVolume: '1,280',
    volumeNum: 1280,
    type: 'Target Hub',
    category: 'Global Financial & Diplomatic Target',
    actors: ['Targeted by APT29, Scattered Spider, Ransomware Groups'],
    vectors: ['Social Engineering Helpdesks', 'MFA Fatigue', 'Session Hijacking'],
    targets: ['Healthcare (NHS)', 'Investment Banking', 'National Security'],
    color: '#38bdf8'
  },
  {
    id: 'au',
    country: 'Australia',
    city: 'Sydney / Canberra',
    code: 'AU',
    x: 820,
    y: 330,
    threatLevel: 'Moderate Target',
    threatScore: 75,
    attackVolume: '690',
    volumeNum: 690,
    type: 'Target Hub',
    category: 'Critical Minerals & Telecommunications Defense',
    actors: ['Targeted by Volt Typhoon, Black Basta'],
    vectors: ['Zero-Day Edge Exploits', 'Data Extortion', 'Identity Theft'],
    targets: ['Mining Infrastructure', 'Healthcare Records', 'Port Operations'],
    color: '#38bdf8'
  }
];

// Active Cyber Attack Arcs (Curved Ballistic Attack Trajectories from Origins to Targets)
const ATTACK_ARCS = [
  { id: 'arc-ru-us', from: { x: 580, y: 110 }, to: { x: 210, y: 165 }, control: { x: 390, y: 50 }, color: '#f43f5e', label: 'APT29 Cloud Exfiltration', speed: '2.8s' },
  { id: 'arc-cn-us', from: { x: 720, y: 175 }, to: { x: 210, y: 165 }, control: { x: 460, y: 40 }, color: '#f43f5e', label: 'Volt Typhoon Edge Living-off-the-Land', speed: '2.4s' },
  { id: 'arc-kp-us', from: { x: 780, y: 165 }, to: { x: 210, y: 165 }, control: { x: 500, y: 60 }, color: '#f97316', label: 'Lazarus DeFi Token Theft', speed: '3.1s' },
  { id: 'arc-ru-ua', from: { x: 580, y: 110 }, to: { x: 535, y: 145 }, control: { x: 560, y: 120 }, color: '#f43f5e', label: 'Sandworm Substation Wiper Probe', speed: '1.6s' },
  { id: 'arc-ir-us', from: { x: 590, y: 195 }, to: { x: 210, y: 165 }, control: { x: 400, y: 120 }, color: '#f97316', label: 'Peach Sandstorm Password Spraying', speed: '3.3s' },
  { id: 'arc-ru-uk', from: { x: 580, y: 110 }, to: { x: 460, y: 130 }, control: { x: 520, y: 105 }, color: '#f43f5e', label: 'Cozy Bear Diplomatic Phishing', speed: '2.1s' },
  { id: 'arc-cn-in', from: { x: 720, y: 175 }, to: { x: 665, y: 220 }, control: { x: 700, y: 190 }, color: '#f43f5e', label: 'RedFoxtrot Power Grid Scanning', speed: '1.9s' },
  { id: 'arc-br-de', from: { x: 320, y: 300 }, to: { x: 495, y: 140 }, control: { x: 400, y: 200 }, color: '#eab308', label: 'Grandoreiro Banking Trojan Feed', speed: '3.5s' }
];

export default function GlobalThreatMap({ onSelectCountry }) {
  const [selectedHotspot, setSelectedHotspot] = useState(THREAT_HOTSPOTS[0]); // Default to Russia
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ORIGINS' | 'TARGETS' | 'CRITICAL'
  const [isLivePulseActive, setIsLivePulseActive] = useState(true);
  const [liveCounter, setLiveCounter] = useState(48920);

  // Live attack ticker increment simulation
  useEffect(() => {
    if (!isLivePulseActive) return;
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 8) + 3);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLivePulseActive]);

  // Filter hotspots based on selected tab
  const displayedHotspots = THREAT_HOTSPOTS.filter(h => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ORIGINS') return h.type === 'Origin Hub';
    if (filterType === 'TARGETS') return h.type === 'Target Hub';
    if (filterType === 'CRITICAL') return h.threatLevel.includes('Critical') || h.threatScore >= 90;
    return true;
  });

  return (
    <div style={{
      background: 'var(--bg-glass-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* "?"?"? Top Toolbar: Title, Live Status, Filters "?"?"? */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Global Threat Activity & Attack Origins Map
              </h2>
              <span style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Flame size={12} />
                LIVE HEATMAP
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Real-time geospatial intelligence, attack trajectories, and nation-state adversary activity.
            </p>
          </div>
        </div>

        {/* Right side controls: Live toggle & Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Live Attack Stream Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: 'var(--text-secondary)'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isLivePulseActive ? '#10b981' : '#64748b',
              boxShadow: isLivePulseActive ? '0 0 10px #10b981' : 'none'
            }} />
            <span>Intercepted Today:</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {liveCounter.toLocaleString()}
            </strong>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
            {[
              { id: 'ALL', label: 'All Hotspots' },
              { id: 'ORIGINS', label: 'Threat Origins' },
              { id: 'TARGETS', label: 'Target Zones' },
              { id: 'CRITICAL', label: 'Critical' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterType === f.id ? 'var(--accent-dim)' : 'transparent',
                  color: filterType === f.id ? 'var(--accent)' : 'var(--text-tertiary)',
                  outline: filterType === f.id ? '1px solid var(--border-accent)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* "?"?"? Main Map Container (Split into SVG Map & Interactive Telemetry Card) "?"?"? */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Dark Cybersecurity SVG World Map */}
        <div style={{
          background: 'radial-gradient(ellipse at center, #091224 0%, #050811 100%)',
          border: '1px solid rgba(0, 229, 255, 0.15)',
          borderRadius: '14px',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '380px'
        }}>
          {/* Cyber Grid & Radar Lines Background */}
          <svg
            viewBox="0 0 960 460"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'visible',
              filter: 'drop-shadow(0 0 12px rgba(0, 229, 255, 0.05))'
            }}
          >
            <defs>
              {/* Glow filter for active cyber nodes */}
              <filter id="cyberGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Arc gradient Russian/Chinese origin */}
              <linearGradient id="redAttackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.4" />
              </linearGradient>

              {/* Arc gradient Iranian/DPRK origin */}
              <linearGradient id="orangeAttackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Latitude & Longitude Grid Lines */}
            <g stroke="rgba(0, 229, 255, 0.05)" strokeWidth="1" strokeDasharray="3 4">
              <line x1="40" y1="90" x2="920" y2="90" />
              <line x1="40" y1="165" x2="920" y2="165" />
              <line x1="40" y1="230" x2="920" y2="230" stroke="rgba(0, 229, 255, 0.12)" strokeDasharray="none" /> {/* Equator */}
              <line x1="40" y1="310" x2="920" y2="310" />
              <line x1="40" y1="390" x2="920" y2="390" />

              <line x1="160" y1="40" x2="160" y2="420" />
              <line x1="320" y1="40" x2="320" y2="420" />
              <line x1="480" y1="40" x2="480" y2="420" stroke="rgba(0, 229, 255, 0.12)" strokeDasharray="none" /> {/* Prime Meridian */}
              <line x1="640" y1="40" x2="640" y2="420" />
              <line x1="800" y1="40" x2="800" y2="420" />
            </g>

            {/* Equator & Prime Meridian Coordinate Labels */}
            <text x="45" y="226" fill="rgba(0, 229, 255, 0.3)" fontSize="9" fontFamily="var(--font-mono)">EQ 0°</text>
            <text x="45" y="161" fill="rgba(0, 229, 255, 0.2)" fontSize="9" fontFamily="var(--font-mono)">30°N</text>
            <text x="45" y="86" fill="rgba(0, 229, 255, 0.2)" fontSize="9" fontFamily="var(--font-mono)">60°N</text>
            <text x="45" y="306" fill="rgba(0, 229, 255, 0.2)" fontSize="9" fontFamily="var(--font-mono)">30°S</text>

            {/* "?"?"? WORLD CONTINENT SILHOUETTES (Equirectangular Dark Vectors) "?"?"? */}
            <g fill="#0e172a" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round">
              {/* North America (Alaska, Canada, USA, Mexico) */}
              <path d="M 80 70 L 115 50 L 165 45 L 210 55 L 260 50 L 305 70 L 290 100 L 260 120 L 250 150 L 280 165 L 255 190 L 230 195 L 215 220 L 180 205 L 155 170 L 130 130 L 110 95 Z" />
              
              {/* Greenland */}
              <path d="M 330 45 L 375 40 L 390 65 L 365 85 L 340 75 Z" />

              {/* Central America & Caribbean */}
              <path d="M 215 220 L 245 235 L 265 240 L 255 255 L 235 245 Z" />

              {/* South America */}
              <path d="M 255 255 L 290 250 L 345 270 L 360 300 L 335 360 L 305 400 L 290 395 L 280 340 L 260 290 Z" />

              {/* United Kingdom & Ireland */}
              <path d="M 450 115 L 465 110 L 460 135 L 445 135 Z" />

              {/* Scandinavia & Western Europe */}
              <path d="M 470 70 L 510 65 L 505 110 L 525 125 L 505 160 L 460 165 L 455 140 L 475 130 Z" />

              {/* Africa */}
              <path d="M 455 170 L 535 170 L 565 200 L 585 240 L 560 330 L 525 365 L 490 350 L 450 250 L 440 200 Z" />
              {/* Madagascar */}
              <path d="M 590 300 L 605 305 L 595 340 L 580 335 Z" />

              {/* Northern Eurasia / Russia / Central Asia */}
              <path d="M 515 65 L 610 55 L 720 50 L 820 60 L 870 85 L 850 115 L 780 120 L 710 130 L 610 135 L 530 125 Z" />

              {/* Middle East & Arabian Peninsula */}
              <path d="M 550 175 L 610 175 L 620 220 L 585 235 L 560 210 Z" />

              {/* South Asia / India */}
              <path d="M 625 175 L 680 175 L 700 210 L 665 260 L 635 215 Z" />

              {/* East Asia / China / Korea */}
              <path d="M 685 135 L 775 130 L 800 170 L 760 220 L 705 210 Z" />

              {/* Japan Archipelago */}
              <path d="M 815 135 L 830 145 L 825 175 L 810 165 Z" />

              {/* Southeast Asia (Indochina, Malaysia, Indonesia, Philippines) */}
              <path d="M 720 225 L 760 225 L 755 255 L 730 250 Z" />
              <path d="M 725 265 L 790 270 L 775 285 L 715 280 Z" />

              {/* Australia */}
              <path d="M 770 305 L 850 300 L 865 340 L 835 385 L 780 375 L 755 335 Z" />

              {/* New Zealand */}
              <path d="M 880 375 L 895 380 L 885 415 L 870 405 Z" />
            </g>

            {/* "?"?"? ANIMATED CYBER ATTACK ARCS (Curved Trajectories) "?"?"? */}
            {ATTACK_ARCS.map(arc => (
              <g key={arc.id}>
                {/* Background Track */}
                <path
                  d={`M ${arc.from.x} ${arc.from.y} Q ${arc.control.x} ${arc.control.y} ${arc.to.x} ${arc.to.y}`}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="1.2"
                  strokeOpacity="0.25"
                  strokeDasharray="3 3"
                />

                {/* Animated Flowing Laser Pulse */}
                <path
                  d={`M ${arc.from.x} ${arc.from.y} Q ${arc.control.x} ${arc.control.y} ${arc.to.x} ${arc.to.y}`}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="24 160"
                  filter="url(#cyberGlow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="184"
                    to="0"
                    dur={arc.speed}
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            ))}

            {/* "?"?"? THREAT HOTSPOT NODES & CONCENTRIC RADAR PINGS "?"?"? */}
            {displayedHotspots.map(h => {
              const isSelected = selectedHotspot?.id === h.id;
              const isTarget = h.type === 'Target Hub';
              const dotColor = h.color;

              return (
                <g
                  key={h.id}
                  onClick={() => {
                    setSelectedHotspot(h);
                    if (onSelectCountry) onSelectCountry(h);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Concentric Expanding Radar Ring 1 */}
                  {isLivePulseActive && (
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="16"
                      fill="none"
                      stroke={dotColor}
                      strokeWidth="1"
                      strokeOpacity="0.7"
                    >
                      <animate
                        attributeName="r"
                        values="6;26"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Concentric Expanding Radar Ring 2 (Staggered) */}
                  {isLivePulseActive && (
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="10"
                      fill="none"
                      stroke={dotColor}
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                    >
                      <animate
                        attributeName="r"
                        values="4;18"
                        dur="2.4s"
                        begin="1.2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0"
                        dur="2.4s"
                        begin="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="12"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Center Threat Node Dot */}
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={isSelected ? 6 : 4.5}
                    fill={dotColor}
                    stroke="#06090f"
                    strokeWidth="1.5"
                    filter="url(#cyberGlow)"
                  />

                  {/* Country Code Label */}
                  <text
                    x={h.x}
                    y={h.y - 10}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'}
                    fontSize={isSelected ? '10.5' : '9'}
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                  >
                    {h.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(6, 9, 15, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '11px',
            color: 'var(--text-tertiary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
                <span>Critical Origin Hub</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                <span>High Threat Origin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
                <span>Target & Cloud Bastion</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Crosshair size={13} color="var(--accent)" />
              <span>Click any node to inspect telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Hotspot Telemetry Card & Leaderboard */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Active Hotspot Inspector Card */}
          {selectedHotspot && (
            <div style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${selectedHotspot.color}55`,
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: `0 8px 24px ${selectedHotspot.color}15`,
              position: 'relative'
            }}>
              {/* Country Header & Severity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedHotspot.type} ? {selectedHotspot.city}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    {selectedHotspot.country} ({selectedHotspot.code})
                  </h3>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  background: `${selectedHotspot.color}20`,
                  color: selectedHotspot.color,
                  border: `1px solid ${selectedHotspot.color}45`
                }}>
                  {selectedHotspot.threatLevel}
                </span>
              </div>

              {/* Threat Score & Live Volume Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                padding: '10px 12px',
                background: 'var(--bg-base)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Threat Severity</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: selectedHotspot.color, fontFamily: 'var(--font-mono)' }}>
                    {selectedHotspot.threatScore}/100
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Attacks / Minute</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedHotspot.attackVolume}
                  </div>
                </div>
              </div>

              {/* Adversary & APT Attribution */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Attributed Adversaries & Syndicates:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {selectedHotspot.actors.map(actor => (
                    <span
                      key={actor}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Attack Vectors */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Primary TTPs & Vectors:
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {selectedHotspot.vectors.join(' ? ')}
                </div>
              </div>

              {/* Key Targets */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Sectors Affected: <strong style={{ color: 'var(--text-primary)' }}>{selectedHotspot.targets.join(', ')}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Top 5 Threat Originating Countries Mini Leaderboard */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Top Threat Origin Hubs
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                Attacks / Min
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {THREAT_HOTSPOTS
                .filter(h => h.type === 'Origin Hub')
                .sort((a, b) => b.volumeNum - a.volumeNum)
                .slice(0, 4)
                .map((hotspot, idx) => (
                  <div
                    key={hotspot.id}
                    onClick={() => setSelectedHotspot(hotspot)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: selectedHotspot?.id === hotspot.id ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                      border: selectedHotspot?.id === hotspot.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', width: '12px' }}>
                        {idx + 1}
                      </span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hotspot.color }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {hotspot.country}
                      </span>
                    </div>

                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: hotspot.color, fontFamily: 'var(--font-mono)' }}>
                      {hotspot.attackVolume}/min
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
