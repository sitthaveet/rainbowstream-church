"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";

/** Fixed header with the DESIGN.md signature: logo shrinks and a blurred
 *  translucent background fades in as the page scrolls. */
export function Header() {
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 80], [88, 56]);
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.72]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      style={{ height }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center"
    >
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 border-b bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-lg"
      />
      <Link href="/" className="relative" aria-label="หน้าหลัก">
        <motion.div style={{ scale: logoScale }} transition={{ ease: "easeOut" }}>
          <Image
            src="/logo-192.png"
            alt="Rainbow Stream Church"
            width={64}
            height={64}
            priority
            className="rounded-full"
          />
        </motion.div>
      </Link>
    </motion.header>
  );
}
