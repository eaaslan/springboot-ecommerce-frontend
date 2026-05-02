import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

/**
 * Compact horizontal product strip used in two places:
 *   <RecommendationStrip title="Similar products" path="/api/recommendations/products/5/similar?k=6" />
 *   <RecommendationStrip title="For you"          path="/api/recommendations/users/42?k=6" />
 *
 * Renders nothing if the API returns an empty list (so empty users / no similar items don't show
 * an awkward empty section).
 */
export default function RecommendationStrip({ title, path }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(path)
      .then((r) => {
        if (cancelled) return;
        setItems(r.data || []);
      })
      .catch(() => setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="rec-strip">
      <h3>{title}</h3>
      <div className="rec-row">
        {items.map((p) => (
          <Link to={`/products/${p.id}`} key={p.id} className="rec-card">
            <div className="rec-img" />
            <div className="rec-body">
              <p className="rec-name">{p.name}</p>
              <strong>
                {p.priceAmount} {p.priceCurrency}
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
