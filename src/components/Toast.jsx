import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Toast({ msg, type = "ok", onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className={`toast ${type}`}
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      transition={{ duration: 0.22 }}
      role="status"
      aria-live="polite"
    >
      <div className="toast-dot" aria-hidden="true" />
      <div className="toast-msg">{msg}</div>
      <button className="toast-x" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </motion.div>
  );
}
