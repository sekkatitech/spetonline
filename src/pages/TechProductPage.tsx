import { useParams } from 'react-router-dom';
import { ProductDetailTemplate } from '../components/product/ProductDetailTemplate';

export function TechProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailTemplate supplier="syntech" idOrSlug={id} fallbackRoute="/shop/tech" />;
}
