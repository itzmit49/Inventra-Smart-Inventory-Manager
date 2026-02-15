import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container-fluid" style={{ backgroundColor: "#F8FAFB" }}>

      {/* HERO */}
      <div className="container text-center py-4 py-lg-5">
        <h1 className="display-6 fw-bold mb-3">
          Inventory & Billing Management Dashboard
        </h1>

        <p className="lead text-muted mb-4 px-2">
          A professional MERN-powered platform for managing products,
          monitoring stock levels, generating invoices, and tracking
          business sales — all in real time.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link
            to="/products"
            className="btn btn-lg"
            style={{ backgroundColor: "#16A085", color: "white" }}
          >
            Manage Inventory →
          </Link>

          <Link
            to="/sales-history"
            className="btn btn-lg btn-outline-secondary"
          >
            View Sales History
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="container text-center py-4 py-lg-5">
        <h3 className="mb-3">
          Ready to run your inventory like real business software?
        </h3>

        <Link
          to="/products"
          className="btn btn-lg"
          style={{ backgroundColor: "#16A085", color: "white" }}
        >
          Start Managing →
        </Link>
      </div>

    </div>
  );
}
