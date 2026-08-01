"use client";

import { motion } from "framer-motion";
import { ArrowDown, Package, Trash2, Clock, Wallet, CloudRain, Heart } from "lucide-react";

export default function GreenStatisticsInfographic() {
  return (
    <section className="py-24 bg-[#F5F3F0] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
          >
            Every Product You Buy Creates Impact
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.1 }}
            className="text-[#5C5550]"
          >
            Satu keputusan kecil Anda menghasilkan rantai kebaikan yang luar biasa.
          </motion.p>
        </div>

        <div className="flex flex-col items-center">
          {/* 1 Product Start */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#16A34A] text-white w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl mb-6 relative z-10"
          >
            <Package size={32} className="mb-2" />
            <span className="font-bold text-xl">1</span>
            <span className="text-xs font-medium">Product</span>
          </motion.div>

          {/* Chain of impact */}
          <div className="space-y-4 relative w-full flex flex-col items-center">
            {/* Connecting Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[#16A34A]/20 -z-10"></div>

            {[
              { id: 1, icon: Trash2, text: "3 kg Waste Diverted", bg: "bg-white", border: "border-[#EAE5E0]" },
              { id: 2, icon: Clock, text: "2 Hours Community Work", bg: "bg-white", border: "border-[#EAE5E0]" },
              { id: 3, icon: Wallet, text: "Additional Household Income", bg: "bg-white", border: "border-[#EAE5E0]" },
              { id: 4, icon: CloudRain, text: "CO₂ Reduction", bg: "bg-white", border: "border-[#EAE5E0]" },
              { id: 5, icon: Heart, text: "Support Circular Economy", bg: "bg-gradient-to-r from-[#16A34A] to-[#14B8A6]", border: "border-transparent", textClass: "text-white font-bold" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="flex flex-col items-center">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <ArrowDown className="text-[#16A34A] mb-4" size={24} />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.1 }}
                    className={`flex items-center gap-4 ${stat.bg} ${stat.border} border rounded-full px-6 py-4 shadow-sm min-w-[280px] md:min-w-[400px]`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stat.textClass ? 'bg-white/20' : 'bg-[#F0FDF4]'}`}>
                      <Icon size={20} className={stat.textClass ? 'text-white' : 'text-[#16A34A]'} />
                    </div>
                    <span className={`text-base md:text-lg ${stat.textClass || 'text-[#1F1B18] font-semibold'}`}>
                      {stat.text}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
