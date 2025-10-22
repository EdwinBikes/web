
import React from 'react';

const ScrollDownIcon = () => (
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
      <a href="#portfolio" aria-label="Scroll to portfolio">
        <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </a>
  </div>
);

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      <video
        src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>
      <div className="relative z-20 text-white px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 leading-tight">
          Historias en Movimiento
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Creando narrativas visuales que cautivan e inspiran. Explora mi último trabajo en cinematografía y fotografía.
        </p>
        <a 
          href="https://wa.me/573057135213" 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-400 text-black font-bold py-3 px-8 rounded-full hover:bg-amber-500 transition-colors duration-300 text-lg shadow-lg hover:shadow-amber-400/30"
        >
          Contáctame
        </a>
      </div>
      <ScrollDownIcon />
    </section>
  );
};

export default Hero;