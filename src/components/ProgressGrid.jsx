import React from "react";
import { Link } from "react-router-dom";
import { LOCATIONS } from "../data/locations.js";

export default function ProgressGrid({ state }) {
  const solved = state.solved || {};
  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Your 1–10 Hunt Map</h2>
        <p className="card-sub">
          Scan a QR code to unlock the location page. Each location has one quick mini‑game.
        </p>
      </div>

      <div className="grid10" role="list" aria-label="Locations 1 through 10">
        {LOCATIONS.map((l) => {
          const done = !!solved[l.id];
          return (
            <Link
              key={l.id}
              role="listitem"
              to={`/loc/${l.id}`}
              className={`tile ${done ? "done" : ""}`}
              aria-label={`Location ${l.id}: ${l.city}. ${done ? "Completed." : "Not completed."}`}
            >
              <div className="tile-num">{l.id}</div>
              <div className="tile-body">
                <div className="tile-city">{l.city}</div>
                <div className="tile-region">{l.region}</div>
              </div>
              <div className="tile-status">
                {done ? (
                  <span className="chip ok">Found</span>
                ) : (
                  <span className="chip">Not found</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
