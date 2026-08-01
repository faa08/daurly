"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

const flowItems = [
  "Waste", "Sorting", "Training", "Production", 
  "Quality Control", "Branding", "Marketplace", 
  "Customer", "Reuse", "Recycle Again"
];

export default function ProcessFlowInfographic() {
  const containerRef = useRef<HTMLElement>(null);
  const [visibleIndex, setVisibleIndex] = useState(-1);
  
  // Track scroll progress within this section for the sticky effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Convert scroll progress (0 to 1) into a discrete index (0 to 9)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Scroll progress from 0.1 to 0.9 will reveal the 10 items.
    if (latest < 0.1) {
      setVisibleIndex(-1);
    } else if (latest >= 0.9) {
      setVisibleIndex(flowItems.length - 1);
    } else {
      // Calculate which item should be visible based on progress
      const progressRange = 0.8; // 0.9 - 0.1
      const step = progressRange / flowItems.length; // 0.08 per item
      const currentStep = Math.floor((latest - 0.1) / step);
      setVisibleIndex(currentStep);
    }
  });

  return (
    <section ref={containerRef} className="bg-white relative h-auto md:h-[300vh]">
      {/* 
        On mobile: regular vertical flow (relative layout)
        On desktop: sticky to screen, h-screen to center the infographic and trigger animation on scroll
      */}
      <div className="relative py-24 md:py-0 md:sticky md:top-0 md:h-screen flex flex-col justify-center w-full overflow-hidden">
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-[#1F1B18] mb-4"
            >
              Infinite Circular Economy Loop
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.1 }}
              className="text-[#5C5550] max-w-2xl mx-auto"
            >
              Siklus tanpa akhir yang memastikan material terus dimanfaatkan, mengurangi limbah secara maksimal.
            </motion.p>
          </div>

          {/* Mobile View: Vertical list with arrows */}
          <div className="md:hidden flex flex-col items-center gap-4">
            {flowItems.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#DCFCE7] text-[#15803D] font-bold py-3 px-6 rounded-full border border-[#16A34A]/20 shadow-sm w-48 text-center"
                >
                  {item}
                </motion.div>
                {index < flowItems.length - 1 && (
                  <ArrowDown className="text-[#16A34A] my-2" size={20} />
                )}
              </div>
            ))}
            <ArrowUp className="text-[#16A34A] mt-2 animate-bounce" size={24} />
            <span className="text-xs text-[#16A34A] font-semibold mt-1">Back to start</span>
          </div>

          {/* Desktop View: Circle layout with Scroll-Jacking */}
          <div className="hidden md:flex relative w-[500px] h-[500px] mx-auto items-center justify-center">
            {/* Inner decorative circle */}
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-dashed border-[#16A34A]/30 animate-spin-slow"></div>
            
            <div className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#16A34A] to-[#14B8A6] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-center leading-tight">
                Infinite<br/>Loop
              </span>
            </div>

            {flowItems.map((item, index) => {
              const angle = (index * (360 / flowItems.length) - 90) * (Math.PI / 180);
              const radius = 220; // Distance from center
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);

              // Item is visible if its index is less than or equal to the currently visible index
              const isVisible = index <= visibleIndex;

              return (
                <div
                  key={index}
                  className="absolute z-10"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <motion.div
                    animate={{ 
                      opacity: isVisible ? 1 : 0, 
                      scale: isVisible ? 1 : 0 
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white text-[#1F1B18] font-bold text-sm py-2 px-4 rounded-full border border-[#EAE5E0] shadow-md whitespace-nowrap hover:border-[#16A34A] hover:text-[#16A34A] transition-colors cursor-default"
                  >
                    {item}
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
