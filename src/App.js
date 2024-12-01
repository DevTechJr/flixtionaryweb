import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { Modal, Button } from "flowbite-react";
import { FaFilm, FaLightbulb, FaGamepad } from "react-icons/fa";
import { GiPopcorn } from "react-icons/gi";
import { Analytics } from "@vercel/analytics/react"
import MovieFetcher from "./components/MovieFetcher";
import DailyChallenge from "./components/DailyChallenge1";
import FullLeaderboard from "./components/FullLeaderboard";

function App() {
  const [showModal, setShowModal] = useState(false);

  const getRandomColor = () => {
    const colors = [
      "bg-red-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-blue-400",
      "bg-purple-400",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    // Check session storage to decide whether to show the modal
    const isModalShown = sessionStorage.getItem("modalShown");
    if (!isModalShown) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("modalShown", "true");
  };

  const handleReopenModal = () => {
    setShowModal(true);
  };

  return (
    <Router>
      <Analytics />
      <div className="min-h-screen bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-white mb-2">flixtionary</h1>
            <p className="text-xl text-gray-300">
              Use the clue and your movie knowledge to guess the word!
            </p>
          </div>
          {/* Navigation Bar */}
          <nav className="mb-6">
            <ul className="flex justify-center items-center space-x-4">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-4 py-2 transition ease-in-out linear duration-500 rounded-full border text-white hover:underline ${isActive
                      ? "border-white font-bold italic text-xl transition ease-in-out linear duration-500"
                      : "border-gray-700 font-medium hover:text-gray-400"
                    }`
                  }
                >
                  Zen Mode
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/daily-challenge"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full border text-yellow-400 hover:underline ${isActive
                      ? "border-yellow-400 font-bold text-xl italic transition ease-in-out linear duration-500"
                      : "border-gray-700 font-medium hover:text-yellow-300"
                    }`
                  }
                >
                  Daily Challenge
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleReopenModal}
                  className="px-4 py-2 bg-red-800 font-medium rounded-full border border-red-700 text-red-200 hover:text-white hover:underline"
                >
                  How To Play
                </button>
              </li>
            </ul>
          </nav>

          {/* Content */}
          <Routes>
            <Route path="/" element={<MovieFetcher />} />
            <Route path="/daily-challenge" element={<DailyChallenge />} />
            <Route path="/leaderboard" element={<FullLeaderboard />} />
          </Routes>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <Modal show={showModal} onClose={handleCloseModal}>
          <Modal.Header className="text-center flex items-center">
            Welcome to{" "}
            <span className={`${getRandomColor()} inline-flex items-center`}>
              <GiPopcorn /> <i>flixtionary</i>{" "}
            </span>{" "}
            !
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">How to Play:</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li className="flex items-center">
                  <FaFilm className="mr-2 text-blue-600" />
                  A random word related to a movie is selected for each turn.
                </li>
                <li className="flex items-center">
                  <FaLightbulb className="mr-2 text-yellow-500" />
                  Use the clues provided to guess the mystery word.
                </li>
                <li className="flex items-center">
                  <FaGamepad className="mr-2 text-green-600" />
                  You get up to 5 guesses and 3 extra clues per turn.
                </li>
              </ul>
              <p className="text-gray-600">
                Click "Give Up" to reveal the answer and proceed to the next turn.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCloseModal} color="success">
              Let’s Start!
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Router>
  );
}

export default App;
