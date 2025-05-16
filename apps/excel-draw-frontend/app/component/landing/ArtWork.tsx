"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export function ArtWork() {
  const router = useRouter();
  const listVariant = {
    initial: {
      opacity: 0,
      scale: 0.8, 
    },
    whileInView: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.4, 
      } 
    },
    viewport: { once: true } 
  };
  return (
  <div>
    hi
  </div>
  );
}
