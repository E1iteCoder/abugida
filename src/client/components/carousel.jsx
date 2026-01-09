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
    src: "https://res.cloudinary.com/dc6jadrue/image/upload/v1767987175/lalibela_n2oxtt.jpg",
    alt: "Second slide",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/dc6jadrue/image/upload/v1767987375/fasiledes_amkspo.jpg",
    alt: "Third slide",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/dc6jadrue/image/upload/v1767987430/anbesa_bqrgze.jpg",
    alt: "Fourth slide",
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
        onError={(e) => {
          // Fallback if image fails to load
          console.warn('Image failed to load:', slides[currentIndex].src);
        }}
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
