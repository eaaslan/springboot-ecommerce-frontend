import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page, size });
    if (search.trim()) params.set("name", search.trim());
    api
      .get(`/api/products?${params.toString()}`)
      .then((r) => {
        const data = r.data || r;
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, size, search]);

  return (
    <div className="container">
      <h1>Catalog</h1>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
        />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {products.map((p) => (
          <Link to={`/products/${p.id}`} key={p.id} className="card">
            <div className="card-img" />
            <h3>{p.name}</h3>
            <p className="muted">{p.category?.name}</p>
            <strong>
              {p.priceAmount} {p.priceCurrency}
            </strong>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pager">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            ← Prev
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
