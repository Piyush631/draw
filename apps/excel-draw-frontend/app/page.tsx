import { ArtWork } from "./component/landing/ArtWork";
import { Features } from "./component/landing/Features";
import { Footer } from "./component/landing/Footer";

import { Header } from "./component/landing/Header";
import { Hero } from "./component/landing/Hero";
import { Video } from "./component/landing/video";

import { ToastContainer, toast } from "react-toastify";

export default function Home() {
  return (
    <div className=" bg-gradient-to-br from-[#f8f6f2] via-[#e2deda] to-[#ddd9d3]">
      <Header />
      <ToastContainer />
      <Hero />
      <Video />
      <Features />
      <ArtWork />
      <Footer />
    </div>
  );
}
