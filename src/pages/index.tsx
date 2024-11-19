import React from "react";
import AudioRecorder from "../components/AudioRecorder";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AudioRecorder />
    </div>
  );
};

export default Home;
