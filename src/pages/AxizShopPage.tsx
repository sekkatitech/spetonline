import { SUPPLIERS } from '../lib/supplierCatalog';
import { SupplierShopPage } from './SupplierShopPage';

export function AxizShopPage() {
  return <SupplierShopPage config={SUPPLIERS.axiz} />;
}
