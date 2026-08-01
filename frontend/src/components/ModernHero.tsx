"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Shield, Users } from "lucide-react";

export default function ModernHero() {
  return (
    <section className="relative w-full min-h-[600px] overflow-hidden bg-[#F5F3F0] flex items-center pt-8 pb-16">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-[#DCFCE7] blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-[#14B8A6] blur-3xl opacity-10" />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0FDF4] border border-[#4ADE80]/30 text-[#15803D] font-medium text-sm w-fit">
            <Leaf size={16} />
            <span>Indonesia's First Circular Economy Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1F1B18] leading-tight tracking-tight">
            Building Indonesia's <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] to-[#14B8A6]">
              Circular Economy
            </span>{" "}
            Ecosystem
          </h1>

          <p className="text-lg text-[#5C5550] leading-relaxed max-w-xl">
            Memberdayakan masyarakat melalui pelatihan, inkubasi bisnis, produksi produk daur ulang, pemasaran digital, dan marketplace berkelanjutan untuk menciptakan dampak ekonomi, sosial, dan lingkungan.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Link
              href="#ecosystem"
              className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Join Ecosystem <ArrowRight size={18} />
            </Link>
            <Link
              href="/kategori"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#1F1B18] font-semibold py-3 px-6 rounded-lg transition-all shadow-sm border border-[#EAE5E0] hover:border-[#16A34A]/30"
            >
              Explore Marketplace
            </Link>
            <Link
              href="#partner"
              className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#F0FDF4] text-[#15803D] font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Become Partner
            </Link>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:flex justify-center items-center"
        >
          {/* Main Floating Element */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-80 h-80 bg-white rounded-2xl shadow-xl p-8 border border-[#EAE5E0]/50 flex flex-col items-center justify-center gap-6"
          >
            <div className="w-32 h-32 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2">
              <Leaf className="text-[#16A34A] w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-center text-[#1F1B18]">Green Innovation</h3>
            <p className="text-center text-[#5C5550] text-sm">
              Ubah limbah menjadi produk bernilai tinggi.
            </p>
          </motion.div>

          {/* Secondary Floating Elements */}
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-6 -right-6 z-20 w-40 h-40 bg-white rounded-xl shadow-lg p-4 border border-[#EAE5E0]/50 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
              <Users className="text-[#0284C7] w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-center">Community Empowerment</span>
          </motion.div>

          <motion.div
            animate={{ y: [15, -15, 15] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-6 -left-6 z-20 w-44 h-40 bg-white rounded-xl shadow-lg p-4 border border-[#EAE5E0]/50 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Shield className="text-[#D97706] w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-center">Digital Marketplace</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
