"use client";
import { useEffect, useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { GoPencil } from "react-icons/go";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
export function Header() {
  const [visible, setVisible] = useState(false);
  const [isToken, setIsToken] = useState(false);
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsToken(true);
    } else {
      setIsToken(false);
    }
  }, []);
  return (
    <header
      id="header"
      className={`fixed top-0 left-0 w-full  transition-transform backdrop-blur-xl  duration-300 z-50 ${
        showHeader ? "translate-y-0 " : "-translate-y-full"
      }`}
    >
      <motion.div initial={{y:-15,opacity:0}}
      animate={{y:0,opacity:1}}
      transition={{duration:1,ease:"easeInOut"}}
      
      
      className="  lg:px-20  md:px-16 px-6 ">
        <div className="flex  h-16  justify-between   pt-3 ">
          <div className="flex gap-5 items-center ">
            <div
              onClick={() => {
                router.push("/");
              }}
              className="font-semibold text-xl flex items-center gap-1 justify-center"
            >
              <div className="pt-1 font-semibold text-xl">
                <GoPencil />
              </div>
              <div className="cursor-pointer scale-y-120">CoCreate. </div>
            </div>
            <div>
              <div className="md:flex gap-4 hidden pt-1 text-gray-800 text-sm font-[530]">
                <Link href="/#features">
                  {" "}
                  <div className="hover:bg-[#d4d0ce]  flex items-center h-8 px-2 rounded-2xl">
                    Features
                  </div>{" "}
                </Link>
                <Link href="/#artwork">
                  {" "}
                  <div className="hover:bg-[#d4d0ce]  flex items-center h-8 px-2 rounded-2xl">
                    ArtWork
                  </div>{" "}
                </Link>

                <a href="https://github.com/Piyush631" target="_blank">
                  {" "}
                  <div className="hover:bg-[#d4d0ce]  flex items-center h-8 px-2 rounded-2xl">
                    GitHub
                  </div>{" "}
                </a>
              </div>
            </div>
          </div>
          {!isToken ? (
            <div className="flex gap-4 pt-2  ">
              <div className="hidden md:flex gap-2">
                <div
                  className="hover:bg-[#d4d0ce]  flex items-center text-sm h-8  px-2 rounded-2xl cursor-pointer"
                  onClick={() => {
                    router.push("/signin");
                  }}
                >
                  <div>Demo</div>
                </div>
                <div
                  className="hover:bg-[#d4d0ce]  flex items-center text-sm h-8  px-2 rounded-2xl cursor-pointer"
                  onClick={() => {
                    router.push("/signin");
                  }}
                >
                  <div>Signin</div>
                </div>
                <div
                  className="h-8  flex items-center rounded-2xl text-sm px-4 border border-black hover:bg-white hover:text-black  cursor-pointer text-white bg-black"
                  onClick={() => {
                    router.push("/signup");
                  }}
                >
                  <div>Try for free</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setVisible(!visible);
                }}
                className=" text-2xl flex md:hidden "
              >
                {visible ? <IoClose /> : <IoMenu />}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 mt-2  ">
              <div className="hidden md:flex gap-4">
                <div
                  className=" h-8 flex items-center  rounded-2xl px-4 cursor-pointer hover:bg-[#d4d0ce]  "
                  onClick={() => {
                    router.push("/room");
                  }}
                >
                  <div>Dashboard</div>
                </div>
                <div
                  className=" h-8 flex items-center  rounded-2xl px-4 cursor-pointer hover:bg-[#d4d0ce]  "
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsToken(false);
                  }}
                >
                  Logout
                </div>
              </div>

              <div
                onClick={() => {
                  setVisible(!visible);
                }}
                className=" text-2xl flex md:hidden "
              >
                {visible ? <IoClose /> : <IoMenu />}
              </div>
            </div>
          )}
        </div>
        <div>
          {visible && (
            <div className="h-full pb-4 pt-5  w-full flex flex-col items-center justify-center">
              <div className="flex flex-col gap-2">
                <div>Features</div>
                <div>Template</div>
                <div>Pricing</div>
                <div>GitHub</div>
              </div>
              <div className=" pt-3 flex gap-4 ">
                <div>Sign In</div>
                <div>Sign Up</div>
              </div>
            </div>
          )}
        </div>
      </ motion.div>
    </header>
  );
}
