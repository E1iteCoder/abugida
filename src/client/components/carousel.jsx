import React, { useState, useEffect } from "react";
import "../styles/home/carousel.css"; // Import the CSS file

const slides = [
  {
    id: 1,
    src: "https://miro.medium.com/v2/resize:fit:3000/1*PGQ3iBUGESZanTqinlL_Cw.jpeg",
    alt: "First slide",
  },
  {
    id: 2,
    src: "https://images.freeimages.com/images/large-previews/e4c/rock-hewn-church-ethiopia-1206416.jpg",
    alt: "Second slide",
  },
  {
    id: 3,
    src: "https://images.freeimages.com/images/large-previews/f8b/obelisk-at-axum-1549881.jpg",
    alt: "Third slide",
  },
];

export default function CarouselPart() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const nextSlide = () => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      setIsSliding(false);
    }, 500); // Match this duration with the CSS animation duration
  };

  // Automatically transition to the next slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // 5000 ms = 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="carousel">
      <img
        className={`carousel-image ${isSliding ? "sliding" : ""}`}
        src={slides[currentIndex].src}
        alt={slides[currentIndex].alt}
      />
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => {
              setIsSliding(true);
              setCurrentIndex(index);
              setTimeout(() => setIsSliding(false), 500); // Match this duration with the CSS animation duration
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}
