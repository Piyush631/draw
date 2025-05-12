"use client";
import { IoMdBrush } from "react-icons/io";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { IoShareSocialSharp } from "react-icons/io5";
import { CiCloudOn } from "react-icons/ci";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const data = [
  {
    icon: <IoMdBrush />,
    name: "Advance Brushes",
    desc: " Customizable brushes with pressure sensitivity and texture controls",
  },
  {
    icon: <FaWandMagicSparkles />,
    name: "Advance Brushesugug",
    desc: " Customizable brushes with pressure sensitivity and texture controls",
  },
  {
    icon: <CiCloudOn />,

    name: "Advance Brushes3",
    desc: " Customizable brushes with pressure sensitivity and texture controls",
  },
  {
    icon: <IoShareSocialSharp />,

    name: "Advance Brushes2",
    desc: " Customizable brushes with pressure sensitivity and texture controls",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const listVariant = {
    initial: {
      opacity: 0,
      scale: 0.8, 
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.4, 
      }
    }
  };
  
  return (
    <div id="features" className="w-full pt-16 lg:px-24 md:px-16 px-6">
      <div className="text-center font-medium md:text-5xl text-4xl">
        Professional Tools, Intuitive Design
      </div>
      <div className="w-full flex justify-center">
        <div className="text-lg md:text-xl lg:w-1/2 w-full text-gray-500 text-center pt-4">
          Everything you need to bring your creative vision to life, all in one
          powerful application
        </div>
      </div>
      <motion.div 
        ref={ref}
        variants={listVariant} 
        initial="initial" 
        animate={isInView ? "animate" : "initial"} 
        className="grid grid-cols-1 pt-12 sm:grid-cols-2 gap-10 px-4 sm:px-8 lg:px-16"
      >
        {data.map((m) => (
          <motion.div 
            variants={listVariant}
            key={m.name}
            className="group cursor-pointer h-full py-5 flex flex-col gap-4 md:px-4 px-2 lg:px-6 shadow-xl hover:shadow-gray-600 bg-gray-200 rounded-2xl"
          >
            <div className="group-hover:rotate-12 w-10 lg:text-2xl text-xl">
              {m.icon}
            </div>
            <div className="lg:text-2xl text-xl font-semibold">{m.name}</div>
            <div>{m.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
