export interface VisitorLocation {
  city: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  visitsCount: number;
  percentage: number;
  deviceSplit: { desktop: number; mobile: number; tablet: number };
  topInterest: string;
}

export interface VisitorMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number; // e.g. 34.2 (%)
  avgSessionDuration: string; // e.g. "3m 42s"
  liveActiveUsers: number;
  growthRate: number; // percentage change vs previous period
  topLocations: VisitorLocation[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  trafficSources: { name: string; percentage: number; count: number }[];
  timeSeriesData: { date: string; visitors: number; pageViews: number }[];
  marketingInsight: {
    title: string;
    description: string;
    recommendedPromo: string;
    targetCity: string;
  };
}

export type TimeHorizon = 'daily' | 'weekly' | 'monthly';

// Base visitor locations centering around South Africa + key regional/international hubs
const BASE_LOCATIONS: Omit<VisitorLocation, 'visitsCount' | 'percentage'>[] = [
  { city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', lat: -26.2041, lng: 28.0473, deviceSplit: { desktop: 52, mobile: 44, tablet: 4 }, topInterest: 'Enterprise & Laptops' },
  { city: 'Cape Town', province: 'Western Cape', country: 'South Africa', lat: -33.9249, lng: 18.4241, deviceSplit: { desktop: 48, mobile: 47, tablet: 5 }, topInterest: 'Apple MacBooks & Accessories' },
  { city: 'Durban', province: 'KwaZulu-Natal', country: 'South Africa', lat: -29.8587, lng: 31.0218, deviceSplit: { desktop: 38, mobile: 58, tablet: 4 }, topInterest: 'Gaming & Components' },
  { city: 'Pretoria', province: 'Gauteng', country: 'South Africa', lat: -25.7479, lng: 28.2293, deviceSplit: { desktop: 60, mobile: 36, tablet: 4 }, topInterest: 'Business Networking' },
  { city: 'Gqeberha (Port Elizabeth)', province: 'Eastern Cape', country: 'South Africa', lat: -33.9608, lng: 25.6022, deviceSplit: { desktop: 35, mobile: 61, tablet: 4 }, topInterest: 'Desktop PCs & Displays' },
  { city: 'Bloemfontein', province: 'Free State', country: 'South Africa', lat: -29.1181, lng: 26.2243, deviceSplit: { desktop: 42, mobile: 54, tablet: 4 }, topInterest: 'Monitors & Office Gear' },
  { city: 'Mbombela (Nelspruit)', province: 'Mpumalanga', country: 'South Africa', lat: -25.4753, lng: 30.9694, deviceSplit: { desktop: 30, mobile: 66, tablet: 4 }, topInterest: 'Smart Home & Power' },
  { city: 'Polokwane', province: 'Limpopo', country: 'South Africa', lat: -23.9045, lng: 29.4689, deviceSplit: { desktop: 28, mobile: 68, tablet: 4 }, topInterest: 'Mobile & Printers' },
  { city: 'London', province: 'Greater London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, deviceSplit: { desktop: 70, mobile: 26, tablet: 4 }, topInterest: 'Enterprise B2B Solutions' },
  { city: 'Frankfurt', province: 'Hesse', country: 'Germany', lat: 50.1109, lng: 8.6821, deviceSplit: { desktop: 75, mobile: 22, tablet: 3 }, topInterest: 'Hardware Wholesale' }
];

export function getVisitorAnalytics(timeframe: TimeHorizon): VisitorMetrics {
  const multipliers = {
    daily: { total: 1420, unique: 1150, pageViews: 4890, growth: 12.4, days: 1, live: 42 },
    weekly: { total: 9850, unique: 7640, pageViews: 34120, growth: 18.7, days: 7, live: 38 },
    monthly: { total: 42800, unique: 31200, pageViews: 148900, growth: 24.1, days: 30, live: 45 }
  }[timeframe];

  const totalVisits = multipliers.total;
  
  // Calculate proportional visits per location
  const locationWeights = [0.34, 0.26, 0.14, 0.11, 0.05, 0.04, 0.02, 0.02, 0.01, 0.01];
  const topLocations: VisitorLocation[] = BASE_LOCATIONS.map((loc, idx) => {
    const visitsCount = Math.round(totalVisits * locationWeights[idx]);
    const percentage = Number(((visitsCount / totalVisits) * 100).toFixed(1));
    return {
      ...loc,
      visitsCount,
      percentage
    };
  });

  // Time series data points
  const timeSeriesData: { date: string; visitors: number; pageViews: number }[] = [];
  const now = new Date();

  if (timeframe === 'daily') {
    // 24 hours
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      // diurnal traffic curve
      const h = d.getHours();
      const curve = h >= 8 && h <= 20 ? 1 + Math.sin(((h - 8) / 12) * Math.PI) * 0.8 : 0.3 + Math.random() * 0.2;
      const v = Math.round((multipliers.total / 24) * curve);
      timeSeriesData.push({
        date: hourStr,
        visitors: v,
        pageViews: Math.round(v * 3.4)
      });
    }
  } else if (timeframe === 'weekly') {
    // 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const dayStr = dayNames[d.getDay()];
      const base = Math.round(multipliers.total / 7);
      const variance = (Math.sin(i) * 0.2 + 0.9);
      const v = Math.round(base * variance);
      timeSeriesData.push({
        date: dayStr,
        visitors: v,
        pageViews: Math.round(v * 3.5)
      });
    }
  } else {
    // 30 days (grouped in 5-day buckets or 30 days)
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      const base = Math.round(multipliers.total / 30);
      const variance = (Math.cos(i / 2) * 0.25 + 1.0);
      const v = Math.round(base * variance);
      timeSeriesData.push({
        date: dateStr,
        visitors: v,
        pageViews: Math.round(v * 3.6)
      });
    }
  }

  // Marketing insights based on top location
  const topLoc = topLocations[0];
  const insight = {
    title: `High Traffic Concentration in ${topLoc.city} (${topLoc.percentage}% of Total Visitors)`,
    description: `Visitors from ${topLoc.city} & ${topLoc.province} have generated ${topLoc.visitsCount.toLocaleString()} sessions with heavy interest in "${topLoc.topInterest}".`,
    recommendedPromo: `Launch a targeted "${topLoc.city} Tech Specials" banner with free regional shipping to boost conversions.`,
    targetCity: topLoc.city
  };

  return {
    totalVisitors: multipliers.total,
    uniqueVisitors: multipliers.unique,
    pageViews: multipliers.pageViews,
    bounceRate: 31.8,
    avgSessionDuration: '4m 12s',
    liveActiveUsers: multipliers.live,
    growthRate: multipliers.growth,
    topLocations,
    deviceBreakdown: { desktop: 51, mobile: 44, tablet: 5 },
    trafficSources: [
      { name: 'Google Organic Search', percentage: 46, count: Math.round(multipliers.total * 0.46) },
      { name: 'Direct / Bookmarks', percentage: 28, count: Math.round(multipliers.total * 0.28) },
      { name: 'Social Media (Instagram/LinkedIn)', percentage: 16, count: Math.round(multipliers.total * 0.16) },
      { name: 'Email & WhatsApp Campaigns', percentage: 10, count: Math.round(multipliers.total * 0.10) }
    ],
    timeSeriesData,
    marketingInsight: insight
  };
}

/**
 * Client-side session visit recorder to track real page views in local storage
 */
export function recordVisit() {
  try {
    const key = 'spet_visitor_sessions';
    const raw = localStorage.getItem(key);
    const visits: { timestamp: number; path: string }[] = raw ? JSON.parse(raw) : [];
    visits.push({ timestamp: Date.now(), path: window.location.pathname });
    // keep last 100 entries
    if (visits.length > 100) visits.shift();
    localStorage.setItem(key, JSON.stringify(visits));
  } catch {
    /* ignore storage errors */
  }
}
