"use client";

import { motion } from "framer-motion";
import { ArrowRight, Recycle, Factory, Paintbrush, ShoppingCart, User, RefreshCw } from "lucide-react";

const flowSteps = [
  { id: 1, title: "Raw Material", icon: Recycle, desc: "Limbah terpilah", color: "from-[#FBBF24] to-[#F59E0B]" },
  { id: 2, title: "Production", icon: Factory, desc: "Inovasi pengolahan", color: "from-[#38BDF8] to-[#0284C7]" },
  { id: 3, title: "Brand", icon: Paintbrush, desc: "Kualitas & Estetika", color: "from-[#A78BFA] to-[#7C3AED]" },
  { id: 4, title: "Marketplace", icon: ShoppingCart, desc: "Platform Daurly", color: "from-[#34D399] to-[#059669]" },
  { id: 5, title: "Customer", icon: User, desc: "Eco-conscious buyer", color: "from-[#F472B6] to-[#DB2777]" },
  { id: 6, title: "Repeat Purchase", icon: RefreshCw, desc: "Siklus berlanjut", color: "from-[#4ADE80] to-[#16A34A]" },
];

export default function WasteToWorth() {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
          >
            From Waste to Worth
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-[#5C5550] max-w-2xl mx-auto"
          >
            Bagaimana limbah yang tidak bernilai bertransformasi menjadi produk premium melalui ekosistem yang saling terintegrasi.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-2">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === flowSteps.length - 1;
            
            return (
              <div key={step.id} className="flex flex-col lg:flex-row items-center w-full lg:w-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex flex-col items-center group relative w-full lg:w-32"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg mb-4 transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <Icon className="text-[#3E3834] group-hover:scale-110 transition-transform duration-300" size={32} />
                    </div>
                  </div>
                  <h4 className="font-bold text-[#1F1B18] text-center mb-1">{step.title}</h4>
                  <p className="text-xs text-[#5C5550] text-center">{step.desc}</p>
                </motion.div>

                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.1 }}
                    className="my-4 lg:my-0 lg:mx-2"
                  >
                    <ArrowRight className="text-[#D5CFC9] hidden lg:block" size={24} />
                    <ArrowRight className="text-[#D5CFC9] block lg:hidden rotate-90" size={24} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
