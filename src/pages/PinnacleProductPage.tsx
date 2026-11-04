import { useParams } from 'react-router-dom';
import { ProductDetailTemplate } from '../components/product/ProductDetailTemplate';

export function PinnacleProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailTemplate supplier="pinnacle" idOrSlug={id} fallbackRoute="/shop/pinnacle" />;
}
