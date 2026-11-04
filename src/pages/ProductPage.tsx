import { useParams } from 'react-router-dom';
import { ProductDetailTemplate } from '../components/product/ProductDetailTemplate';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetailTemplate supplier="esquire" idOrSlug={slug} fallbackRoute="/shop/home" />;
}
