"use client";
import { IoColorPaletteOutline } from "react-icons/io5";
import { FaAngleRight } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
export function Hero() {
  const router = useRouter();
  return (
    <div
     
      className="py-24  mt-4 lg:px-24  md:px-16 px-6  w-full "
    >
      < motion.div initial={{  opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, }} className="flex justify-center  items-center gap-4">
        <div className=" text-5xl md:text-7xl lg:text-8xl">
          <IoColorPaletteOutline />
        </div>
        <motion.div
          
          className="text-3xl md:text-4xl lg:text-5xl font-semibold font-secondary italic"
        >
          CoCreate
        </motion.div>
      </motion.div>
      <div className="w-full pt-3 flex justify-center">
        <div className="   pt-4  w-2/3 flex justify-center flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1,delay:0.1,ease:"easeInOut" }} className="text-4xl md:text-5xl lg:text-6xl font-normal md:font-semibold text-center">
            Unleash your <span>creativity </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1,delay:0.2,ease:"easeInOut" }}
            className=" text-4xl md:text-5xl lg:text-6xl font-normal md:font-semibold text-center "
          >
            one stroke at a time
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1,delay:0.3,ease:"easeInOut"  }}
          className="text-lg font-secondary text-center lg:px-24 md:px-14 px-4 ">
            Create stunning digital artwork with our powerful yet intuitive
            drawing tools. Perfect for both beginners and professional artists.
          </motion.div>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 ,delay:0.4,ease:"easeInOut"  }}
           className="flex  flex-col md:flex-row gap-5 pt-6">
            <button
              onClick={() => {
                router.push("/signin");
              }}
              className=" cursor-pointer text-sm md:text-md px-4 py-1  items-center justify-center gap-1 flex h-11  text-white bg-black hover:bg-white hover:text-black rounded-3xl"
            >
              Try for free
              <span className="text-sm  md:text-md ">
                <FaAngleRight />
              </span>
            </button>
            <Link href="/#video">
              <button className=" cursor-pointer text-sm md:text-md px-4 py-1  items-center justify-center gap-1 flex h-11  hover:text-white hover:bg-black bg-white text-black rounded-3xl">
                Watch Demo
                <span className="text-md md:text-xl">
                  <FaArrowRightLong />
                </span>
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
