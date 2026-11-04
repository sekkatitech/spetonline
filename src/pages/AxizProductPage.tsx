import { useParams } from 'react-router-dom';
import { ProductDetailTemplate } from '../components/product/ProductDetailTemplate';

export function AxizProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailTemplate supplier="axiz" idOrSlug={id} fallbackRoute="/shop/axiz" />;
}
