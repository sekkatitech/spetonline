import { SUPPLIERS } from '../lib/supplierCatalog';
import { SupplierShopPage } from './SupplierShopPage';

export function TechShopPage() {
  return <SupplierShopPage config={SUPPLIERS.syntech} />;
}
