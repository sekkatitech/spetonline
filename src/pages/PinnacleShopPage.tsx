import { SUPPLIERS } from '../lib/supplierCatalog';
import { SupplierShopPage } from './SupplierShopPage';

export function PinnacleShopPage() {
  return <SupplierShopPage config={SUPPLIERS.pinnacle} />;
}
