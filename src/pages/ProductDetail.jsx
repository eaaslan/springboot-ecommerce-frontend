import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import OtherSellersPanel from "../components/OtherSellersPanel";
import RecommendationStrip from "../components/RecommendationStrip";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/api/products/${id}`)
      .then((r) => setProduct(r.data || r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onAdd() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    setAdded(false);
    setError("");
    try {
      await addItem(product.id, qty, product.bestListing?.id ?? null);
      setAdded(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="container">Loading…</div>;
  if (error && !product) return <div className="container error">{error}</div>;
  if (!product) return null;

  return (
    <div className="container">
      <div className="detail">
        <div className="detail-img" />
        <div className="detail-body">
          <h1>{product.name}</h1>
          <p className="muted">{product.category?.name}</p>
          <p>{product.description}</p>
          <div className="price-row">
            <strong className="price">
              {product.bestListing
                ? `${product.bestListing.priceAmount} ${product.bestListing.priceCurrency}`
                : `${product.priceAmount} ${product.priceCurrency}`}
            </strong>
            <span className="stock">
              Stock: {product.bestListing ? product.bestListing.stockQuantity : product.stockQuantity}
            </span>
          </div>
          {product.bestListing && (
            <p className="muted">
              Sold by <strong>{product.bestListing.sellerName}</strong>
              {" · ships in "}
              {product.bestListing.shippingDays}d
            </p>
          )}
          <div className="qty-row">
            <label>
              Qty
              <input
                type="number"
                min="1"
                max={product.stockQuantity || 99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <button
              className="btn btn-primary"
              onClick={onAdd}
              disabled={adding || product.stockQuantity === 0}
            >
              {adding ? "Adding…" : product.stockQuantity === 0 ? "Out of stock" : "Add to Cart"}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          {added && <p className="success">Added to cart ✓</p>}
        </div>
      </div>

      <OtherSellersPanel productId={product.id} />

      <RecommendationStrip
        title="Similar products"
        path={`/api/recommendations/products/${product.id}/similar?k=6`}
      />
    </div>
  );
}
