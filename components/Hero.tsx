
import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const line1 = "Real media needs";
  const line2 = "AUTHENTIC PROOF.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="text-center space-y-28 max-w-6xl mx-auto pt-48 pb-20 relative">
      {/* Immersive Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[800px] pointer-events-none opacity-40 select-none">
        <div className="absolute inset-0 bg-grid-forensic" />
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon/10 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="space-y-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="h-[1px] w-12 bg-neon/30"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.8em] text-neon/60 italic">Forensic Suite v2.0.4</span>
          <div className="h-[1px] w-12 bg-neon/30"></div>
        </motion.div>

        <h1 className="text-8xl md:text-[9rem] font-black tracking-tighter leading-[0.85] flex flex-col items-center select-none">
          <span className="flex overflow-hidden">
            {line1.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.02, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-white"
                style={{ whiteSpace: char === " " ? "pre" : "normal" }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          <span className="flex overflow-hidden mt-6 group cursor-default relative pb-4">
            {line2.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.04, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-neon italic group-hover:text-cyber transition-all duration-700"
                style={{ whiteSpace: char === " " ? "pre" : "normal" }}
              >
                {char}
              </motion.span>
            ))}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1.5 bg-neon shadow-[0_0_30px_rgba(0,255,156,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.8, duration: 1.5, ease: "anticipate" }}
            />
          </span>
        </h1>

        <div className="space-y-10 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-2xl md:text-4xl text-white/90 font-light tracking-tight italic leading-relaxed"
          >
            Surgical precision for the <span className="text-white font-medium not-italic underline decoration-neon/40 underline-offset-8">post-truth</span> landscape.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl text-white/40 font-light tracking-tight flex items-center justify-center gap-4 flex-wrap"
          >
            <FeaturePill label="Neuro-Spectral Analysis" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <FeaturePill label="Latent Artifact Detection" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <FeaturePill label="Cross-Modal Verification" />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 1.2, ease: "circOut" }}
        className="flex flex-col items-center gap-10"
      >
        <button
          onClick={() => document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative px-24 py-8 bg-transparent border border-neon/20 text-neon font-black rounded-3xl text-[11px] uppercase tracking-[0.8em] hover:border-neon transition-all duration-1000 active:scale-[0.98] overflow-hidden"
        >
          <span className="relative z-10 group-hover:text-charcoal transition-colors duration-500">Initiate Core Scan</span>
          <motion.div
            className="absolute inset-0 bg-neon -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          />
        </button>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4 opacity-30"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Secure Uplink Below</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeaturePill: React.FC<{ label: string }> = ({ label }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="hover:text-neon transition-colors duration-500 cursor-default"
  >
    {label}
  </motion.span>
);

export default Hero;

const FeatureItem: React.FC<{ icon: string, label: string, desc: string, delay: number }> = ({ icon, label, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className="flex flex-col items-center gap-5 group px-6"
  >
    <div className="w-16 h-16 rounded-[1.5rem] bg-surface border border-border flex items-center justify-center text-white/20 group-hover:text-neon group-hover:border-neon/40 group-hover:shadow-neon-low transition-all duration-500 group-hover:-translate-y-2">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon} />
      </svg>
    </div>
    <div className="text-center space-y-2">
      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white group-hover:text-neon transition-colors duration-500">
        {label}
      </h4>
      <p className="text-[10px] text-white/30 font-light leading-relaxed group-hover:text-white/60 transition-colors">
        {desc}
      </p>
    </div>
  </motion.div>
);

export default Hero;
