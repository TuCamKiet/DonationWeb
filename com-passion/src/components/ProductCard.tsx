import { Link } from 'react-router-dom';
import { formatVND, type Product } from '../data/types';
import { useCart } from '../context/CartContext';
import Photo from './Photo';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const isOutOfStock = product.stock === 0;

  return (
    <article className={`pcard ${isOutOfStock ? 'is-empty' : ''}`}>
      <Link to={isOutOfStock ? '#' : `/san-pham/${product.slug}`} className="pcard__media" onClick={(e) => isOutOfStock && e.preventDefault()}>
        <Photo art={product.art} ratio="1 / 1" imgUrl={product.imageUrl} />
        {isOutOfStock ? (
          <span className="chip pcard__tag" style={{ background: 'var(--text-soft)', color: '#fff' }}>Tạm hết hàng</span>
        ) : (
          product.featured && <span className="chip chip--clay pcard__tag">Nổi bật</span>
        )}
      </Link>
      <div className="pcard__body">
        <div className="pcard__meta">
          <span className="chip chip--green">{product.maker}</span>
          <span className="pcard__region">{product.region}</span>
        </div>
        <h3 className="pcard__name">
          <Link to={isOutOfStock ? '#' : `/san-pham/${product.slug}`} onClick={(e) => isOutOfStock && e.preventDefault()}>
            {product.name}
          </Link>
        </h3>
        <p className="pcard__short muted">{product.short}</p>
        <div className="pcard__foot">
          <span className="pcard__price">{formatVND(product.price)}</span>
          <button 
            className="btn btn--accent pcard__add" 
            onClick={() => add(product)}
            disabled={isOutOfStock}
            style={isOutOfStock ? { background: 'var(--border)', color: 'var(--text-soft)', cursor: 'not-allowed' } : {}}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </article>
  );
}
