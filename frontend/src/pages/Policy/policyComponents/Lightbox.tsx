import { useState } from 'react';

interface LightboxProps {
  imageSrc: string;
  altText: string;
}

export default function Lightbox({ imageSrc, altText }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger element */}
      <a href="#" onClick={openLightbox} aria-label="open lightbox" aria-haspopup="dialog" className="block w-full h-full">
        <img src={imageSrc} alt={altText} className="cursor-pointer w-32" />
      </a>

      {/* Lightbox modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <div className="relative">
            <img src={imageSrc} alt={altText} className="h-[80vh] max-h-screen max-w-[80vw]" />
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full p-2"
              aria-label="close lightbox"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}