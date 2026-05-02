import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/orders")
      .then((r) => setOrders(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Total</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td className={`status status-${o.status}`}>{o.status}</td>
                <td>
                  {o.totalAmount} {o.currency}
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <Link to={`/orders/${o.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data || r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!order) return null;

  return (
    <div className="container narrow">
      <h1>Order #{order.id}</h1>
      <p>
        Status:{" "}
        <span className={`status status-${order.status}`}>{order.status}</span>
      </p>
      {order.failureReason && (
        <p className="error">Reason: {order.failureReason}</p>
      )}
      <p>
        Placed: {new Date(order.createdAt).toLocaleString()} <br />
        Payment id: {order.paymentId ?? "—"}
      </p>

      <h3>Items</h3>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Line</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id}>
              <td>{it.productName}</td>
              <td>
                {it.priceAmount} {it.priceCurrency}
              </td>
              <td>{it.quantity}</td>
              <td>
                {(it.priceAmount * it.quantity).toFixed(2)} {it.priceCurrency}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {order.subtotalAmount && order.discountAmount > 0 && (
            <>
              <tr>
                <td colSpan="3">Subtotal</td>
                <td>
                  {order.subtotalAmount} {order.currency}
                </td>
              </tr>
              <tr>
                <td colSpan="3">Discount ({order.couponCode})</td>
                <td className="discount-cell">
                  −{order.discountAmount} {order.currency}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan="3">Total</td>
            <td>
              <strong>
                {order.totalAmount} {order.currency}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>

      <p>
        <Link to="/orders">← Back to orders</Link>
      </p>
    </div>
  );
}
