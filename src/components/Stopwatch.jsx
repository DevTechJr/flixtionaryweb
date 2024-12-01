import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Stopwatch = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const startTimestamp = new Date(startTime).getTime();

    // Update elapsed time every second
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTimestamp) / 1000)); // Elapsed time in seconds
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [startTime]);

  // Format elapsed time into HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-lg font-bold text-gray-700 text-center">
      Elapsed Time: {formatElapsedTime(elapsedTime)}
    </div>
  );
};

Stopwatch.propTypes = {
  startTime: PropTypes.string.isRequired, // Expected to be an ISO string
};

export default Stopwatch;
