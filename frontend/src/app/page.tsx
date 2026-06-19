import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import HeroBanner from "@/components/HeroBanner";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <SearchBar />
      <main>
        <HeroBanner />
        <Categories />
        <FeaturedProducts />
        <ValueProps />
      </main>
      <Footer />
    </>
  );
}
