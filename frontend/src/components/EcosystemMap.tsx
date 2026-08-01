"use client";

import { motion } from "framer-motion";
import { 
  Recycle, Factory, Users, GraduationCap, 
  Lightbulb, Bot, ShoppingBag, Truck, 
  Megaphone, Building2, Landmark, Globe
} from "lucide-react";
import { useState } from "react";

const ecosystemItems = [
  { id: 1, label: "Waste Collection", icon: Recycle, desc: "Pengumpulan limbah plastik, tekstil, dan minyak jelantah." },
  { id: 2, label: "Recycling Production", icon: Factory, desc: "Pemrosesan limbah menjadi material siap pakai." },
  { id: 3, label: "Community Empowerment", icon: Users, desc: "Pemberdayaan masyarakat & UMKM lokal." },
  { id: 4, label: "Training Center", icon: GraduationCap, desc: "Pelatihan ekonomi sirkular dan green jobs." },
  { id: 5, label: "Business Incubation", icon: Lightbulb, desc: "Inkubasi bisnis untuk produk daur ulang." },
  { id: 6, label: "AI Green Assistant", icon: Bot, desc: "Asisten AI untuk keberlanjutan bisnis." },
  { id: 7, label: "Marketplace", icon: ShoppingBag, desc: "Platform jual beli produk daur ulang." },
  { id: 8, label: "Distribution", icon: Truck, desc: "Distribusi ramah lingkungan." },
  { id: 9, label: "Digital Marketing", icon: Megaphone, desc: "Pemasaran digital terintegrasi." },
  { id: 10, label: "Corporate Partnership", icon: Building2, desc: "Kolaborasi dengan perusahaan mitra." },
  { id: 11, label: "Government Collaboration", icon: Landmark, desc: "Dukungan dan sinergi program pemerintah." },
  { id: 12, label: "Sustainability Impact", icon: Globe, desc: "Pengukuran dampak lingkungan & sosial." },
];

export default function EcosystemMap() {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  return (
    <section id="ecosystem" className="py-20 bg-white overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4">Circular Economy Ecosystem</h2>
          <p className="text-[#5C5550] max-w-2xl mx-auto">
            Platform terintegrasi dari hulu ke hilir untuk menciptakan dampak ekonomi, sosial, dan lingkungan yang berkelanjutan.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-[4/3] flex items-center justify-center">
          {/* Center Logo */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="absolute z-20 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#16A34A] to-[#14B8A6] rounded-full shadow-2xl flex items-center justify-center border-4 border-white"
          >
            <span className="text-white font-extrabold text-2xl md:text-3xl tracking-wider">DAURLY</span>
          </motion.div>

          {/* Lines to center */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {ecosystemItems.map((_, i) => {
              const angle = (i * (360 / ecosystemItems.length)) * (Math.PI / 180);
              const x = 50 + 40 * Math.cos(angle);
              const y = 50 + 40 * Math.sin(angle);
              return (
                <line 
                  key={`line-${i}`}
                  x1="50" y1="50" x2={x} y2={y} 
                  stroke="#EAE5E0" strokeWidth="0.5" 
                  strokeDasharray="2,2"
                />
              );
            })}
          </svg>

          {/* Ecosystem Nodes */}
          {ecosystemItems.map((item, i) => {
            const angle = (i * (360 / ecosystemItems.length)) * (Math.PI / 180);
            // Use CSS custom properties to position absolutely in a circle
            const radius = 42; // Percentage distance from center
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <div
                key={item.id}
                className="absolute z-10 flex flex-col items-center justify-center group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setActiveItem(item.id)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${
                      isActive ? 'bg-[#16A34A] text-white scale-110' : 'bg-white text-[#15803D] border border-[#EAE5E0] hover:border-[#16A34A]'
                    }`}
                  >
                    <Icon size={isActive ? 28 : 24} className="transition-all duration-300" />
                  </div>
                  
                  <div className={`absolute top-full mt-2 w-32 text-center transition-all duration-300 ${isActive ? 'opacity-100 z-30' : 'opacity-0 md:opacity-100'}`}>
                    <span className={`text-xs md:text-sm font-semibold block ${isActive ? 'text-[#16A34A]' : 'text-[#3E3834]'}`}>
                      {item.label}
                    </span>
                    
                    {/* Tooltip for desktop hover */}
                    <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-[#1F1B18] text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none transition-all duration-300 origin-top ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                      {item.desc}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
