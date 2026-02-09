import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { LOCATIONS } from "../data/locations.js";

export default function AdminLinks() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="stack">
      <section className="page-head">
        <div className="crumbs">
          <Link to="/" className="crumb">Home</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb">Admin Links</span>
        </div>
        <h1 className="h1">QR Link List (Admin)</h1>
        <p className="muted">
          Use these URLs to generate QR codes. Each QR should link to its location page.
        </p>
      </section>

      <Card title="Location URLs" sub="Paste each URL into any QR generator.">
        <div className="table">
          <div className="trow thead">
            <div>#</div>
            <div>Location</div>
            <div>URL</div>
          </div>
          {LOCATIONS.map((l) => {
            const url = `${origin}/loc/${l.id}`;
            return (
              <div className="trow" key={l.id}>
                <div className="mono">{l.id}</div>
                <div>{l.city}</div>
                <div className="mono wrapline">{url}</div>
              </div>
            );
          })}
        </div>

        <div className="hint muted">
          Pro tip: Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, libero nam. Repellendus tempora autem suscipit hic consequatur quia praesentium nulla eveniet sit commodi perferendis pariatur, qui cupiditate? Culpa, fugit optio.
        </div>
      </Card>
    </div>
  );
}
