"use client";

import { useEffect } from "react";
import { initScrollFx } from "./engine";
import "./scroll-fx.css";

/** Mount once on the landing page. Renders nothing. */
export default function ScrollFx() {
  useEffect(() => initScrollFx(), []);
  return null;
}
