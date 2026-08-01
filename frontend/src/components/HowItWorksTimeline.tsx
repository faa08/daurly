"use client";

import { motion } from "framer-motion";
import { Recycle, Layers, Users, Factory, BadgeCheck, Paintbrush, Share2, ShoppingCart, TrendingUp, Leaf } from "lucide-react";
import { useRef } from "react";

const steps = [
  { id: 1, title: "Waste Collection", icon: Recycle, desc: "Mengumpulkan limbah dari masyarakat, perusahaan, dan komunitas." },
  { id: 2, title: "Waste Sorting", icon: Layers, desc: "Pemilahan berdasarkan jenis material (Plastik, Tekstil, dll)." },
  { id: 3, title: "Community Empowerment", icon: Users, desc: "Pelatihan sirkular ekonomi untuk UMKM dan kelompok rentan." },
  { id: 4, title: "Production", icon: Factory, desc: "Proses produksi limbah menjadi produk bernilai tinggi." },
  { id: 5, title: "Quality Control", icon: BadgeCheck, desc: "Standarisasi kualitas produk hasil daur ulang." },
  { id: 6, title: "Branding", icon: Paintbrush, desc: "Desain kemasan, storytelling, dan fotografi produk." },
  { id: 7, title: "Digital Marketing", icon: Share2, desc: "Pemasaran melalui media sosial dan marketplace." },
  { id: 8, title: "Marketplace Daurly", icon: ShoppingCart, desc: "Produk dijual secara berkelanjutan di platform." },
  { id: 9, title: "Economic Impact", icon: TrendingUp, desc: "Peningkatan pendapatan & penciptaan lapangan kerja." },
  { id: 10, title: "Environmental Impact", icon: Leaf, desc: "Pengurangan limbah & emisi CO₂ secara signifikan." },
];

export default function HowItWorksTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-[#F0FDF4] overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
          >
            Bagaimana Daurly Bekerja
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.1 }}
            className="text-[#5C5550] max-w-2xl mx-auto"
          >
            Proses end-to-end kami mengubah limbah menjadi produk bernilai tinggi sekaligus memberdayakan masyarakat.
          </motion.p>
        </div>

        {/* Horizontal scroll container */}
        <div 
          ref={containerRef}
          className="flex overflow-x-auto pb-12 pt-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-8 px-4 min-w-max relative">
            {/* Timeline connection line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10 h-1 bg-[#DCFCE7] -z-10">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-[#16A34A]"
              />
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="w-64 snap-center flex flex-col items-center group cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#15803D] mb-4 bg-white px-3 py-1 rounded-full shadow-sm border border-[#DCFCE7]">
                    STEP {step.id}
                  </div>
                  
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#F0FDF4] group-hover:border-[#16A34A] transition-colors duration-300 relative z-10 mb-6">
                    <Icon size={32} className="text-[#16A34A]" />
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-[#EAE5E0] text-center w-full min-h-[160px] group-hover:shadow-xl transition-shadow duration-300 relative">
                    {/* Tiny arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-[#EAE5E0]"></div>
                    <h3 className="font-bold text-[#1F1B18] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#5C5550]">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Hide scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
