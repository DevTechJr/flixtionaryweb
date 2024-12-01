import React, { useEffect, useState } from "react";

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0); // Set to 12 AM of the next day
      const difference = nextMidnight - now;

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h : ${minutes
          .toString()
          .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`
      );
    };

    calculateTimeLeft(); // Initial calculation
    const intervalId = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="text-white text-center bg-gray-900 text-4xl font-bold p-4 rounded-lg">
      <span className="text-yellow-300">{timeLeft}</span>
    </div>
  );
};

export default Countdown;
