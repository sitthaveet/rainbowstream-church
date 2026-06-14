"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";

/** Fixed header with the Prism signature: the logo sits in a soft spectral
 *  halo, a flowing rainbow beam underlines the bar, and a blurred translucent
 *  background fades in as the page scrolls. */
export function Header() {
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 80], [96, 60]);
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.7]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const haloOpacity = useTransform(scrollY, [0, 80], [0.7, 0.4]);

  return (
    <motion.header
      style={{ height }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center"
    >
      {/* Translucent blurred backdrop, revealed on scroll */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 border-b bg-gradient-to-b from-background/90 to-background/65 backdrop-blur-xl"
      />

      <Link href="/" className="relative" aria-label="หน้าหลัก">
        {/* Spectral halo behind the mark */}
        <motion.div
          aria-hidden
          style={{ opacity: haloOpacity, background: "var(--gradient-conic)" }}
          className="animate-spin-slow absolute -inset-2 rounded-full blur-md"
        />
        <motion.div
          style={{ scale: logoScale }}
          transition={{ ease: "easeOut" }}
          className="relative"
        >
          <Image
            src="/logo-192.png"
            alt="Rainbow Stream Church"
            width={64}
            height={64}
            priority
            className="rounded-full ring-1 ring-white/40"
          />
        </motion.div>
      </Link>

      {/* The brand beam — a thin flowing spectrum along the bottom edge */}
      <div
        aria-hidden
        className="spectral-rule animate-spectrum-flow absolute inset-x-0 bottom-0 h-px opacity-80"
      />
    </motion.header>
  );
}
