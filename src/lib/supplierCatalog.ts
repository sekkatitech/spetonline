import { supabase } from './supabase';
import type { ProductSupplier } from './productDisplay';

/**
 * Everything that differs between the supplier-backed shop and product routes.
 * Customer-facing copy lives here and must never name the supplier.
 */
export type SupplierKey = Exclude<ProductSupplier, 'esquire'>;

export interface BrandLogo {
  name: string;
  /** Logo lookup. Leave out for brands whose only logo is a supplier's: the tile shows text. */
  domain?: string;
}

export interface SupplierConfig {
  key: SupplierKey;
  label: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  table: string;
  route: string;
  /** Logo tiles above the catalogue. */
  brandTiles: BrandLogo[];
  /** `live` reads brand filter options from the table, `tiles` reuses brandTiles. */
  brandOptions: 'live' | 'tiles';
  specSource: 'specifications' | 'raw_data';
  paginationWindow: number;
}

export const LOGO_TOKEN = 'pk_RSkNTnvvScKErzhoXO5UUg';

export const SUPPLIERS: Record<SupplierKey, SupplierConfig> = {
  syntech: {
    key: 'syntech',
    label: 'Gaming & computing',
    description: 'Storage, memory, components, peripherals, gaming gear and power solutions.',
    seoTitle: 'Gaming & Computing Gear',
    seoDescription:
      'Shop gaming PCs, components, peripherals and computing gear from SPET Online’s Gaming & Computing range, with fast delivery across South Africa.',
    table: 'syntech_products_public',
    route: '/shop/tech',
    brandOptions: 'tiles',
    specSource: 'specifications',
    paginationWindow: 2,
    brandTiles: [
      { name: 'Xiaomi', domain: 'xiaomi.com' },
      { name: 'Ugreen', domain: 'ugreen.com' },
      { name: 'ASUS', domain: 'asus.com' },
      { name: 'Port', domain: 'portdesigns.com' },
      { name: 'Redragon', domain: 'redragon.com' },
      { name: 'MSI', domain: 'msi.com' },
      { name: 'Patriot', domain: 'patriotmemory.com' },
      { name: 'Gizzu', domain: 'gizzu.co.za' },
      { name: 'Winx', domain: 'winxdesign.com' },
      { name: 'HIKSEMI', domain: 'hiksemi.com' },
      { name: 'Cudy', domain: 'cudy.net' },
      { name: 'Keychron', domain: 'keychron.com' },
      { name: 'PCBuilder', domain: 'pcbuilder.net' },
      { name: 'Antec', domain: 'antec.com' },
      { name: 'FSP', domain: 'fsp-group.com' },
      { name: 'Crucial', domain: 'crucial.com' },
      { name: 'AMD', domain: 'amd.com' },
      { name: 'ASRock', domain: 'asrock.com' },
      { name: 'DEEPCOOL', domain: 'deepcool.com' },
      { name: 'GeIL', domain: 'geil.com.tw' },
      { name: 'LG', domain: 'lg.com' },
      { name: 'Intel', domain: 'intel.com' },
      { name: 'Acer', domain: 'acer.com' },
      { name: 'PXN', domain: 'pxn-game.com' },
      { name: 'Seagate', domain: 'seagate.com' },
      { name: 'HIKVISION', domain: 'hikvision.com' },
      { name: 'OWC', domain: 'owc.com' },
      { name: 'Wanbo', domain: 'wanbotech.com' },
      { name: 'Microsoft', domain: 'microsoft.com' },
      { name: 'Micron', domain: 'micron.com' },
      { name: 'Orico', domain: 'orico.com' },
      { name: 'Romoss', domain: 'romoss.com' },
      { name: 'Silverstone', domain: 'silverstonetek.com' },
      { name: 'Minisforum', domain: 'minisforum.com' },
    ],
  },
  axiz: {
    key: 'axiz',
    label: 'Business computing',
    description: 'Business laptops, desktops, memory and accessories from leading brands.',
    seoTitle: 'Business Computing',
    seoDescription:
      'Shop business laptops, desktops, memory and accessories on SPET Online, with fast delivery across South Africa.',
    table: 'axiz_products_public',
    route: '/shop/axiz',
    brandOptions: 'live',
    specSource: 'raw_data',
    paginationWindow: 2,
    // "Dell E" and "HPIC" are exact brand values in the feed; clicking a tile
    // filters on this name, so they stay as they appear in the data.
    brandTiles: [
      { name: 'Dell', domain: 'dell.com' },
      { name: 'Dell E', domain: 'dell.com' },
      { name: 'HPIC', domain: 'hp.com' },
      { name: 'Kingston', domain: 'kingston.com' },
      { name: 'Targus', domain: 'targus.com' },
    ],
  },
  pinnacle: {
    key: 'pinnacle',
    label: 'Computing accessories',
    description: 'Computing accessories, peripherals, networking and security.',
    seoTitle: 'Computing Accessories',
    seoDescription:
      'Shop computing accessories, peripherals, networking and security on SPET Online, with fast delivery across South Africa.',
    table: 'pinnacle_products_public',
    route: '/shop/pinnacle',
    brandOptions: 'live',
    specSource: 'specifications',
    paginationWindow: 2,
    brandTiles: [
      { name: 'TP-Link', domain: 'tp-link.com' },
      { name: 'Hikvision', domain: 'hikvision.com' },
      { name: 'Sandisk', domain: 'sandisk.com' },
      { name: 'HP', domain: 'hp.com' },
      { name: 'Dell', domain: 'dell.com' },
      { name: 'Asus', domain: 'asus.com' },
      { name: 'Port', domain: 'portdesigns.com' },
      { name: 'Seagate', domain: 'seagate.com' },
      { name: 'Huawei', domain: 'huawei.com' },
      { name: 'Hiksemi', domain: 'hiksemi.com' },
      { name: 'Lenovo', domain: 'lenovo.com' },
      { name: 'EZViz', domain: 'ezviz.com' },
      { name: 'NearStream', domain: 'nearstream.com' },
      { name: 'Zone' },
      { name: 'Microsoft', domain: 'microsoft.com' },
      { name: 'PinnPOS' },
      { name: 'LG', domain: 'lg.com' },
      { name: 'Bixolon', domain: 'bixolon.com' },
      { name: 'Western Digital', domain: 'westerndigital.com' },
      { name: 'Zebra', domain: 'zebra.com' },
      { name: 'Mercusys', domain: 'mercusys.com' },
      { name: 'Logitech', domain: 'logitech.com' },
      { name: 'Aten', domain: 'aten.com' },
      { name: 'Hisense', domain: 'hisense.com' },
      { name: 'Zebex', domain: 'zebex.com' },
      { name: 'PinnSec' },
      { name: 'D-Link', domain: 'dlink.com' },
      { name: 'Evolis', domain: 'evolis.com' },
      { name: 'Qnap', domain: 'qnap.com' },
      { name: 'Eaton', domain: 'eaton.com' },
      { name: 'iMiN', domain: 'imin.sg' },
      { name: 'Datalogic', domain: 'datalogic.com' },
      { name: 'Proline', domain: 'proline.co.za' },
      { name: 'CommScope', domain: 'commscope.com' },
      { name: 'Allbro', domain: 'allbro.co.za' },
      { name: 'Adata', domain: 'adata.com' },
      { name: 'Kingston', domain: 'kingston.com' },
      { name: 'FSP', domain: 'fsp-group.com' },
      { name: 'Datanet', domain: 'datanet.co.za' },
      { name: 'Wacom', domain: 'wacom.com' },
    ],
  },
};

const FACET_PAGE_SIZE = 1000;

/**
 * Reads a few columns from every active row. PostgREST caps a response at 1000
 * rows and the supplier tables are larger, so this walks through them in pages.
 */
export async function fetchActiveRows<T>(table: string, columns: string): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += FACET_PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + FACET_PAGE_SIZE - 1);
    if (error || !data) return rows;
    rows.push(...(data as unknown as T[]));
    if (data.length < FACET_PAGE_SIZE) return rows;
  }
}
