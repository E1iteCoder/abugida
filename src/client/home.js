import { useEffect } from "react";
import CarouselPart from "./components/carousel.jsx";
import Introsec from "./components/intro_section.jsx";
import Mission from "./components/mission.jsx";
import GetStarted from "./components/getStarted.jsx";
import "./styles.css";

export default function Home() {
  useEffect(() => {
    document.title = "Home";
  });
  return (
    <div className="App">
      <CarouselPart />
      <br />
      <Introsec />
      <br />
      <Mission />
      <br />
      <GetStarted />
    </div>
  );
}
