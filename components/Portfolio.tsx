
import React from 'react';
import { MediaItem } from '../types';

const mediaItems: MediaItem[] = [
  { id: 1, type: 'image', src: 'https://picsum.photos/seed/filmmaker1/800/600', title: 'Dawn over the mountains', description: 'An early morning shot capturing the first light.' },
  { id: 2, type: 'video', src: 'https://picsum.photos/seed/filmmaker2/800/600', title: 'Ocean\'s Breath', description: 'Slow motion capture of waves crashing on the shore.' },
  { id: 3, type: 'image', src: 'https://picsum.photos/seed/filmmaker3/800/600', title: 'Urban Jungle', description: 'A long exposure of city traffic at night.' },
  { id: 4, type: 'image', src: 'https://picsum.photos/seed/filmmaker4/800/600', title: 'Forest Stillness', description: 'Sunbeams piercing through a dense forest canopy.' },
  { id: 5, type: 'video', src: 'https://picsum.photos/seed/filmmaker5/800/600', title: 'Desert Mirage', description: 'Heat waves rising from the desert floor.' },
  { id: 6, type: 'image', src: 'https://picsum.photos/seed/filmmaker6/800/600', title: 'Portrait of a Stranger', description: 'A candid street photography shot.' },
  { id: 7, type: 'image', src: 'https://picsum.photos/seed/filmmaker7/800/600', title: 'Architectural Lines', description: 'Abstract view of a modern building.' },
  { id: 8, type: 'video', src: 'https://picsum.photos/seed/filmmaker8/800/600', title: 'Starry Night', description: 'A timelapse of the milky way.' },
];

const PlayIcon = () => (
    <svg className="w-16 h-16 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const Portfolio: React.FC = () => {
  return (
    <section>
      <h1 className="text-4xl font-extrabold text-center mb-4 text-white tracking-wide">My Work</h1>
      <p className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        A collection of my recent projects in photography and cinematography. Each piece tells a unique story through light, color, and motion.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaItems.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800">
            <img src={item.src} alt={item.title} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
            {item.type === 'video' && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <PlayIcon />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Portfolio;
