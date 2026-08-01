"use client";

import { motion } from "framer-motion";

const sdgs = [
  { id: 1, num: "1", title: "No Poverty", desc: "Meningkatkan pendapatan masyarakat.", color: "#E5243B" },
  { id: 5, num: "5", title: "Gender Equality", desc: "Pemberdayaan perempuan.", color: "#FF3A21" },
  { id: 8, num: "8", title: "Decent Work", desc: "Menciptakan Green Jobs.", color: "#A21942" },
  { id: 9, num: "9", title: "Industry Innovation", desc: "Mendorong inovasi ekonomi sirkular.", color: "#FD6925" },
  { id: 11, num: "11", title: "Sustainable Cities", desc: "Mengurangi limbah perkotaan.", color: "#FD9D24" },
  { id: 12, num: "12", title: "Responsible Consumption", desc: "Produksi & konsumsi berkelanjutan.", color: "#BF8B2E" },
  { id: 13, num: "13", title: "Climate Action", desc: "Mengurangi emisi karbon.", color: "#3F7E44" },
  { id: 17, num: "17", title: "Partnership", desc: "Kolaborasi ekosistem.", color: "#19486A" },
];

export default function SDGsImpact() {
  return (
    <section className="py-24 bg-[#FCFCFA] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
          >
            Driving Sustainable Development Goals
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.1 }}
            className="text-[#5C5550] max-w-2xl mx-auto"
          >
            Setiap aksi di Daurly berkontribusi langsung pada pencapaian Tujuan Pembangunan Berkelanjutan (SDGs).
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto z-10">
          {/* Connection Lines Background */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
              {/* Lines connecting grid items to center conceptually (just abstract styling) */}
              <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sdgs.map((sdg, index) => (
              <motion.div
                key={sdg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-[#EAE5E0] p-4 flex flex-col items-start gap-3 hover:shadow-md transition-shadow relative overflow-hidden group cursor-default"
              >
                {/* Background colored accent block on hover */}
                <div 
                  className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 group-hover:scale-150 transition-transform duration-500 origin-top-right"
                  style={{ backgroundColor: sdg.color }}
                />
                
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm"
                  style={{ backgroundColor: sdg.color }}
                >
                  {sdg.num}
                </div>
                <div>
                  <h3 className="font-bold text-[#1F1B18] text-sm md:text-base leading-tight mb-1">{sdg.title}</h3>
                  <p className="text-xs text-[#5C5550] line-clamp-3">{sdg.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#16A34A] to-[#14B8A6] p-[2px] rounded-full"
            >
              <div className="bg-white px-8 py-3 rounded-full flex items-center gap-3">
                <span className="font-bold text-[#15803D]">Daurly Ecosystem</span>
                <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-1 rounded">Hub</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
