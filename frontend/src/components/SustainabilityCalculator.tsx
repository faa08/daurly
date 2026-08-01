"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Calculator, Trash2, CloudRain, Wallet, Users, Heart } from "lucide-react";

export default function SustainabilityCalculator() {
  const [productCount, setProductCount] = useState<number>(5);

  // Multipliers based on 1 product impact
  const wasteMultiplier = 3.5; // kg
  const co2Multiplier = 1.2; // kg
  const incomeMultiplier = 25000; // Rp
  const jobsMultiplier = 0.05; // fraction of jobs

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
          >
            Hitung Dampak Keberlanjutan Anda
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-[#5C5550]"
          >
            Lihat seberapa besar kontribusi Anda terhadap lingkungan dan masyarakat melalui pembelian produk Daurly.
          </motion.p>
        </div>

        <div className="bg-[#F5F3F0] rounded-3xl p-8 md:p-12 shadow-sm border border-[#EAE5E0]">
          {/* Input Section */}
          <div className="max-w-xl mx-auto mb-12 text-center bg-white p-8 rounded-2xl shadow-sm border border-[#EAE5E0]">
            <label className="block text-[#1F1B18] font-bold text-lg mb-6 flex items-center justify-center gap-2">
              <Calculator className="text-[#16A34A]" /> Jumlah produk Daurly yang Anda beli:
            </label>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setProductCount(Math.max(1, productCount - 1))}
                className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] font-bold text-xl flex items-center justify-center border border-[#16A34A]/30 hover:bg-[#16A34A] hover:text-white transition-colors"
              >
                -
              </button>
              <input 
                type="number" 
                value={productCount}
                onChange={(e) => setProductCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center text-3xl font-extrabold text-[#1F1B18] bg-transparent border-b-2 border-[#16A34A] focus:outline-none pb-2"
                min="1"
              />
              <button 
                onClick={() => setProductCount(productCount + 1)}
                className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] font-bold text-xl flex items-center justify-center border border-[#16A34A]/30 hover:bg-[#16A34A] hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Impact Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ResultCard 
              icon={Trash2}
              value={productCount * wasteMultiplier}
              suffix=" kg"
              label="Limbah Berkurang"
              color="text-[#059669]"
              bg="bg-[#D1FAE5]"
            />
            <ResultCard 
              icon={CloudRain}
              value={productCount * co2Multiplier}
              suffix=" kg"
              label="CO₂ Dihemat"
              color="text-[#0284C7]"
              bg="bg-[#E0F2FE]"
            />
            <ResultCard 
              icon={Wallet}
              value={productCount * incomeMultiplier}
              prefix="Rp "
              label="Pendapatan Komunitas"
              color="text-[#D97706]"
              bg="bg-[#FEF3C7]"
              separator=","
            />
            <ResultCard 
              icon={Users}
              value={Math.max(1, Math.floor(productCount * jobsMultiplier))}
              suffix=" Jobs"
              label="Pekerjaan Didukung"
              color="text-[#7C3AED]"
              bg="bg-[#EDE9FE]"
            />
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-[#16A34A] text-white px-6 py-3 rounded-full font-semibold shadow-md">
              <Heart size={20} /> Kontribusi untuk 5 SDGs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ icon: Icon, value, prefix = "", suffix = "", label, color, bg, separator = "" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm border border-[#EAE5E0]"
    >
      <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mb-4`}>
        <Icon className={color} size={28} />
      </div>
      <div className="text-2xl md:text-3xl font-extrabold text-[#1F1B18] mb-1 flex items-baseline">
        <span className="text-lg mr-1">{prefix}</span>
        <CountUp end={value} duration={2.5} separator={separator} decimals={value % 1 !== 0 && !separator ? 1 : 0} />
        <span className="text-lg ml-1">{suffix}</span>
      </div>
      <p className="text-sm font-medium text-[#5C5550]">{label}</p>
    </motion.div>
  );
}
