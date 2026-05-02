import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import RecommendationStrip from "../components/RecommendationStrip";

export default function Catalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories once
  useEffect(() => {
    api
      .get("/api/products/categories")
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products on filter change
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page, size });
    if (search.trim()) params.set("name", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    api
      .get(`/api/products?${params.toString()}`)
      .then((r) => {
        const data = r.data || r;
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, size, search, categoryId, minPrice, maxPrice]);

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setPage(0);
  }

  const hasFilters = search || categoryId || minPrice || maxPrice;

  return (
    <div className="container">
      {user && (
        <RecommendationStrip
          title="For you"
          path={`/api/recommendations/users/${user.id}?k=6`}
        />
      )}

      <h1>Catalog</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setPage(0);
            setCategoryId(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => {
            setPage(0);
            setMinPrice(e.target.value);
          }}
          min="0"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => {
            setPage(0);
            setMaxPrice(e.target.value);
          }}
          min="0"
        />
        {hasFilters && (
          <button className="link-btn" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && products.length === 0 && (
        <div className="empty">
          <p>No products match your filters.</p>
          {hasFilters && (
            <button className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="grid">
        {products.map((p) => (
          <Link to={`/products/${p.id}`} key={p.id} className="card">
            <div className="card-img" />
            <h3>{p.name}</h3>
            <p className="muted">{p.category?.name}</p>
            <strong>
              {p.priceAmount} {p.priceCurrency}
            </strong>
            <span className={`stock-pill ${p.stockQuantity === 0 ? "oos" : ""}`}>
              {p.stockQuantity === 0 ? "Out of stock" : `${p.stockQuantity} in stock`}
            </span>
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
