"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    },viewport:{ once: true} 
  };
  return (
    < motion.div variants={listVariant} initial="initial"  whileInView="whileInView" viewport={{ once: true }}  id="artwork" className="lg:px-24  md:px-16 px-6 pt-24 w-full">
      <motion.div variants={listVariant} className=" w-full text-5xl font-semibold text-center">
        Artwork Created with ArtCanvas
      </motion.div>
      <motion.div variants={listVariant} className="text-center pt-3 text-xl">
        Join thousands of artists creating masterpieces every day
      </motion.div>
      <motion.div variants={listVariant} className="flex flex-wrap gap-8 pt-8 justify-center ">
        <motion.div variants={listVariant}>
          <img
            src="./carton1.webp"
            className="md:h-64  hover:p-2 hover:rounded-2xl w-full h-60 rounded-2xl "
            alt=""
          />
        </motion.div>
        <motion.div variants={listVariant}>
          <img
            src="./carton2.webp"
            className="md:h-64 h-60 hover:p-2 hover:rounded-2xl rounded-2xl w-full"
            alt=""
          />
        </motion.div>
        <motion.div variants={listVariant}>
          <img
            src="./carton1.webp"
            className="md:h-64  h-60  hover:p-2 hover:rounded-2xl rounded-2xl w-full"
            alt=""
          />
        </motion.div>
      </motion.div>
      <motion.div variants={listVariant} className="pt-28">
        <div className="text-center text-5xl">Start Creating Today</div>
        <div className="text-center pt-4 text-lg ">
          Join our community of artists and bring your creative vision to life.
          Try ArtCanvas free for 14 days.
        </div>
        <div className="mx-auto w-full flex justify-center pt-4">
          <button
            onClick={() => {
              router.push("/signin");
            }}
            className="bg-gradient-to-r cursor-pointer text-white bg-black hover:bg-white hover:text-black text-lg px-8 py-3 rounded-xl"
          >
            Start Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
