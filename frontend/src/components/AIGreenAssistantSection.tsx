"use client";

import { motion } from "framer-motion";
import { Bot, Lightbulb, TrendingUp, DollarSign, PackageSearch, TreePine, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  { id: 1, icon: Lightbulb, title: "Ide produk baru", desc: "Rekomendasi inovasi produk daur ulang." },
  { id: 2, icon: TrendingUp, title: "Analisis tren pasar", desc: "Data permintaan produk eco-friendly terkini." },
  { id: 3, icon: DollarSign, title: "Estimasi harga", desc: "Kalkulasi harga jual optimal." },
  { id: 4, icon: PackageSearch, title: "Rekomendasi bahan baku", desc: "Saran kombinasi material limbah terbaik." },
  { id: 5, icon: TreePine, title: "AI Sustainability Advisor", desc: "Saran pengurangan jejak karbon operasional." },
  { id: 6, icon: Calculator, title: "Carbon Impact Calculator", desc: "Hitung emisi yang dihemat secara real-time." },
];

export default function AIGreenAssistantSection() {
  return (
    <section className="py-24 bg-[#1F1B18] text-white overflow-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#16A34A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#14B8A6]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >

          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Meet Daurly <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#2DD4BF]">
              AI Green Assistant
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
            Asisten kecerdasan buatan Anda untuk mengoptimalkan bisnis sirkular. Dari ideasi produk hingga kalkulasi dampak karbon, semua dalam satu platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2D2824] border border-[#3E3834] flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[#4ADE80]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500 leading-snug">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Link href="/chat" className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Coba AI Assistant Sekarang <Bot size={20} />
          </Link>
        </motion.div>

        {/* Visual Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex justify-center items-center"
        >
          {/* Mockup Chat UI container */}
          <div className="relative w-full max-w-md bg-[#2D2824] rounded-2xl border border-[#3E3834] shadow-2xl overflow-hidden p-6">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-[#3E3834] pb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16A34A] to-[#14B8A6] flex items-center justify-center shadow-lg">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Daurly AI</h3>
                <span className="text-xs text-[#4ADE80] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span> Online
                </span>
              </div>
            </div>

            {/* Chat Bubbles */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-end gap-1"
              >
                <div className="bg-[#3E3834] text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                  Saya memiliki sisa kain perca 50kg, produk apa yang cocok dibuat?
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16A34A] to-[#14B8A6] shrink-0 flex items-center justify-center mt-1">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-[#16A34A]/20 border border-[#16A34A]/30 text-gray-200 p-4 rounded-2xl rounded-tl-sm text-sm space-y-3">
                  <p>Berdasarkan tren pasar saat ini, rekomendasi terbaik:</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-300">
                    <li><strong>Tote Bag Patchwork</strong> (Harga Jual Rp45rb - Rp75rb)</li>
                    <li><strong>Karpet Tenun Perca</strong> (Demand tinggi di Q3)</li>
                  </ul>
                  <div className="mt-2 bg-[#2D2824] p-2 rounded flex items-center gap-2 border border-[#3E3834]">
                    <TreePine size={16} className="text-[#4ADE80]" />
                    <span className="text-xs text-[#4ADE80]">Menghemat 12kg emisi karbon</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Input area mockup */}
            <div className="mt-8 pt-4 border-t border-[#3E3834] flex gap-2">
              <div className="flex-1 bg-[#1F1B18] rounded-full h-10 border border-[#3E3834]"></div>
              <div className="w-10 h-10 bg-[#16A34A] rounded-full flex items-center justify-center">
                <ArrowRight size={16} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
