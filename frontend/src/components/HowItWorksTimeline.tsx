"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const steps = [
  { 
    id: 1, 
    title: "Waste Collection", 
    image: "/foto/1.png", 
    desc: "Mengumpulkan limbah dari masyarakat, perusahaan, dan komunitas." 
  },
  { 
    id: 2, 
    title: "Waste Sorting", 
    image: "/foto/2.png", 
    desc: "Pemilahan berdasarkan jenis material seperti plastik, tekstil, dan lainnya." 
  },
  { 
    id: 3, 
    title: "Community Empowerment", 
    image: "/foto/3.png", 
    desc: "Pelatihan ekonomi sirkular untuk UMKM dan kelompok masyarakat." 
  },
  { 
    id: 4, 
    title: "Production", 
    image: "/foto/4.png", 
    desc: "Mengolah limbah menjadi produk bernilai tinggi yang siap digunakan." 
  },
];

export default function HowItWorksTimeline() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-[#F0FDF4] overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-[#1F1B18] mb-4 md:mb-6 tracking-tight"
          >
            Bagaimana Daurly Bekerja
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-[#5C5550] text-base md:text-lg max-w-2xl mx-auto px-2"
          >
            Proses end-to-end kami mengubah limbah menjadi produk bernilai tinggi sekaligus memberdayakan masyarakat.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-auto md:h-[550px] flex flex-col md:flex-row rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_15px_35px_rgb(0,0,0,0.1)] md:shadow-[0_20px_50px_rgb(0,0,0,0.15)] border-[3px] md:border-4 border-white"
        >
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`relative overflow-hidden min-h-[220px] md:min-h-full transition-all duration-700 ease-in-out group border-b md:border-b-0 md:border-r border-white/20 last:border-0 ${
                hoveredIndex === index ? 'md:flex-[1.4]' : hoveredIndex !== null ? 'md:flex-[0.85]' : 'md:flex-1'
              } flex-1`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background Image */}
              <Image 
                src={step.image} 
                alt={step.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
              />
              
              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-black/50 md:bg-black/40 transition-colors duration-500 group-hover:bg-black/50" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-center z-10">
                <div className="bg-[#16A34A] text-white text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full mb-3 md:mb-4 shadow-lg">
                  STEP {step.id}
                </div>
                
                <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3 drop-shadow-md">
                  {step.title}
                </h3>
                
                <div className="max-w-[280px] md:max-w-[300px]">
                  <p className="text-white/95 md:text-white/90 text-sm md:text-base leading-snug md:leading-relaxed drop-shadow-md">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
