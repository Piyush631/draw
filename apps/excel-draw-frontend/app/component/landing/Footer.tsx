import Link from "next/link";

export function Footer() {
  return (
    <div className=" mt-24 pt-12 lg:px-24 md:px-16 px-6 border-t-1 border-gray-300 ">
      <div className="flex  gap-6  flex-col md:flex-row justify-center  items-center md:justify-around md:items-start ">
        <div className="flex flex-col gap-4 justify-center ">
          <div className="lg:text-4xl md:text-3xl text-2xl text-center md:text-start">
            Have Good Design Today
          </div>
          <div className="md:w-3/4 w-full text-center md:text-start ">
            High level experience in web design and development knowledge,
            producing quality work.
          </div>
        </div>
        <div className="flex justify-center lg:gap-20 gap-16">
          <div>
            <ul className="flex flex-col gap-3">
              <li className="text-lg font-semibold">Menu</li>
              <Link href="/#header">
                {" "}
                <li>Header</li>
              </Link>
              <Link href="/#features">
                {" "}
                <li>Features</li>
              </Link>
              <Link href="/#video">
                {" "}
                <li>Demo</li>
              </Link>
              <Link href="/#artwork">
                {" "}
                <li>ArtWork</li>
              </Link>
            </ul>
          </div>
          <div>
            <ul className="flex flex-col gap-3">
              <li className="text-lg font-semibold">Follow us</li>
              <a href="https://www.linkedin.com/in/piyush068/" target="_blank">
                {" "}
                <li>linkedIn</li>{" "}
              </a>
              <a href="https://github.com/Piyush631" target="_blank">
                {" "}
                <li>GitHub</li>{" "}
              </a>
              <li>FaceBook</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="  w-full text-center mt-6 bg-gray-200 h-6">
        @2025 All Rights Reserved
      </div>
    </div>
  );
}
