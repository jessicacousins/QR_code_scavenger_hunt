import React from "react";

export default function Card({ title, sub, children, right }) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          {title && <h2 className="card-title">{title}</h2>}
          {sub && <p className="card-sub">{sub}</p>}
        </div>
        {right ? <div className="card-right">{right}</div> : null}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
