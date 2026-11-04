/**
 * Shopper-facing departments for the homepage index.
 *
 * The database only stores supplier category heads ("Notebooks and Laptops",
 * "Uninterruptible Power Supply", …). Customers should browse departments, so
 * we group whatever heads actually exist in the catalogue into a short, stable
 * department list. Nothing is hardcoded to a supplier or a specific product.
 */

export interface ShopperDepartment {
  key: string;
  label: string;
  cta: string;
  match: RegExp;
  /** Puts the department's main category first in its subcategory links. */
  primary: RegExp;
  /** Real category-head values from the catalogue, e.g. "Televisions". */
  heads: string[];
}

interface DepartmentRule {
  key: string;
  label: string;
  cta: string;
  match: RegExp;
  primary: RegExp;
}

const DEPARTMENT_RULES: DepartmentRule[] = [
  {
    key: 'tv-audio',
    label: 'TVs & audio',
    cta: 'Shop all TVs',
    match: /^televisions$|^televisions- accessories$|^hdmi products$|^projectors and accessories$|^multimedia players$/i,
    primary: /^Televisions$/i,
  },
  {
    key: 'laptops',
    label: 'Laptops & computing',
    cta: 'Shop all laptops',
    match: /^notebooks and laptops$|^desktop  computers$|^tablet pc'?s$/i,
    primary: /^Notebooks and Laptops$/i,
  },
  {
    key: 'monitors',
    label: 'Monitors',
    cta: 'Shop all monitors',
    match: /^computer monitors$/i,
    primary: /^Computer Monitors$/i,
  },
  {
    key: 'gaming',
    label: 'Gaming',
    cta: 'Shop all gaming',
    match: /^console gaming units$|^console gaming accessories$|^computer gaming hardware$|^computer gaming accessories$/i,
    primary: /^Console Gaming Units$/i,
  },
  {
    key: 'audio',
    label: 'Audio & soundbars',
    cta: 'Shop all audio',
    match: /^speakers & audio$|^bluetooth products$/i,
    primary: /^Speakers & Audio$/i,
  },
  {
    key: 'networking',
    label: 'Networking',
    cta: 'Shop all networking',
    match: /^wireless network products$|^modems & routers$|^networking-active$|^networking-passive$|^line drivers & extenders$/i,
    primary: /^Wireless Network Products$/i,
  },
  {
    key: 'storage',
    label: 'Storage',
    cta: 'Shop all storage',
    match: /^hard drives\/storage$|^media storage solutions$|^flash memory products$|^hard drive enclosures$|^computer optical drives$/i,
    primary: /^Hard Drives\/Storage$/i,
  },
  {
    key: 'printing',
    label: 'Printing',
    cta: 'Shop all printers',
    match: /^printers$|^printer accessories$/i,
    primary: /^Printers$/i,
  },
  {
    key: 'power',
    label: 'Power backup',
    cta: 'Shop all power backup',
    match: /^uninterruptible power supply$|^renewable power solutions$|^batteries$/i,
    primary: /^Uninterruptible Power Supply$/i,
  },
  {
    key: 'security',
    label: 'Security & CCTV',
    cta: 'Shop all security',
    match: /^cctv and dvr products$|^ip camera products$/i,
    primary: /^CCTV and DVR Products$/i,
  },
  {
    key: 'components',
    label: 'Components',
    cta: 'Shop all components',
    match: /^computer processors$|^computer motherboards$|^computer graphic cards$|^computer memory$|^computer chassis$|^computer cooling$|^server products$/i,
    primary: /^Computer Processors$/i,
  },
];

/** Friendly names for raw supplier heads shown as subcategory links. */
const HEAD_LABELS: Record<string, string> = {
  'Televisions': 'Televisions',
  'Televisions- Accessories': 'TV accessories',
  'HDMI Products': 'HDMI & cables',
  'Projectors and Accessories': 'Projectors',
  'Multimedia Players': 'Media players',
  'Notebooks and Laptops': 'Laptops & notebooks',
  'Desktop  Computers': 'Desktop PCs',
  'Tablet PC\'s': 'Tablets',
  'Computer Monitors': 'Monitors',
  'Console Gaming Units': 'Consoles',
  'Console Gaming Accessories': 'Console accessories',
  'Computer Gaming Hardware': 'Gaming hardware',
  'Computer Gaming Accessories': 'Gaming accessories',
  'Speakers & Audio': 'Speakers & audio',
  'Bluetooth Products': 'Bluetooth audio',
  'Wireless Network Products': 'Wireless networking',
  'Modems & Routers': 'Modems & routers',
  'Networking-Active': 'Switches & networking',
  'Hard Drives/Storage': 'Hard drives & SSDs',
  'Media Storage Solutions': 'NAS & storage',
  'Flash Memory products': 'Flash & memory cards',
  'Printers': 'Printers',
  'Printer Accessories': 'Printer supplies',
  'Uninterruptible Power Supply': 'UPS & inverters',
  'Renewable Power Solutions': 'Solar & backup power',
  'Batteries': 'Batteries',
  'CCTV and DVR Products': 'CCTV & DVR',
  'IP Camera Products': 'IP cameras',
  'Computer Processors': 'Processors',
  'Computer Motherboards': 'Motherboards',
  'Computer Graphic Cards': 'Graphics cards',
  'Computer Memory': 'Memory',
  'Computer Chassis': 'PC cases',
  'Server Products': 'Servers',
};

export function formatHeadLabel(head: string): string {
  const trimmed = head.trim().replace(/\s+/g, ' ');
  return HEAD_LABELS[trimmed] ?? trimmed;
}

const normaliseHead = (head: string) => head.trim().toLowerCase();

export function buildDepartments(categoryHeads: string[]): ShopperDepartment[] {
  // Keep the raw head strings for Supabase `.in()` filters — some catalogue
  // values carry trailing spaces. Only trim for matching, dedupe and display.
  const available = categoryHeads.filter((head) => head && head.trim().length > 0);
  const claimed = new Set<string>();

  return DEPARTMENT_RULES.map((rule) => {
    const seen = new Set<string>();

    const heads = available
      .filter((head) => {
        const key = normaliseHead(head);
        if (claimed.has(key) || seen.has(key)) return false;
        if (!rule.match.test(head.trim())) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => Number(!rule.primary.test(a.trim())) - Number(!rule.primary.test(b.trim())));

    heads.forEach((head) => claimed.add(normaliseHead(head)));
    return { ...rule, heads };
  }).filter((department) => department.heads.length > 0);
}

/** URL for a department's full catalogue view (multi-value head filter). */
export function departmentHref(department: ShopperDepartment): string {
  if (department.heads.length === 0) return '/shop/home';
  return `/shop/home?categoryHead=${department.heads.map(encodeURIComponent).join(',')}`;
}

export function headHref(head: string): string {
  return `/shop/home?categoryHead=${encodeURIComponent(head)}`;
}
