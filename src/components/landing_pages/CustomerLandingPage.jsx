import { Footer } from "../layout/Footer";
import { Navbar } from "../layout/Navbar";
import { Features } from "../sections/Features";
import { Hero } from "../sections/Hero";

export const CustomerLandingPage = ({features}) => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar/>
        <Hero/>
        <Features features = {features}/>
        <Footer />
      </div>
    </>
  );
};
