import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/seller-orders/me")
      .then((r) => setOrders(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = orders.reduce(
    (acc, s) => ({
      subtotal: acc.subtotal + Number(s.subtotalAmount || 0),
      commission: acc.commission + Number(s.commissionAmount || 0),
      payout: acc.payout + Number(s.payoutAmount || 0),
    }),
    { subtotal: 0, commission: 0, payout: 0 }
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Incoming orders</h1>
        <Link to="/seller/dashboard" className="btn">← Dashboard</Link>
      </div>

      {!loading && orders.length > 0 && (
        <div className="seller-summary">
          <div className="seller-summary-card">
            <span className="muted">Sub-orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="seller-summary-card">
            <span className="muted">Gross</span>
            <strong>{totals.subtotal.toFixed(2)}</strong>
          </div>
          <div className="seller-summary-card">
            <span className="muted">Commission</span>
            <strong>−{totals.commission.toFixed(2)}</strong>
          </div>
          <div className="seller-summary-card">
            <span className="muted">Payout</span>
            <strong>{totals.payout.toFixed(2)}</strong>
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <table className="cart-table">
        <thead>
          <tr>
            <th>Sub-order</th>
            <th>Order</th>
            <th>Subtotal</th>
            <th>Commission</th>
            <th>Payout</th>
            <th>Status</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((s) => (
            <tr key={s.id}>
              <td>#{s.id}</td>
              <td>#{s.orderId}</td>
              <td>{s.subtotalAmount} {s.currency}</td>
              <td className="discount-cell">
                −{s.commissionAmount} ({s.commissionPct}%)
              </td>
              <td><strong>{s.payoutAmount} {s.currency}</strong></td>
              <td>
                <span className={`status status-${s.status}`}>{s.status}</span>
              </td>
              <td>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
            </tr>
          ))}
          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">No incoming orders yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
