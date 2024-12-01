import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { Card, Spinner } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import {
  FaPlay,
  FaRegSmileBeam,
  FaInfoCircle,
  FaLightbulb,
  FaGamepad,
  FaFilm,
} from "react-icons/fa";
import { GiPopcorn } from "react-icons/gi";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "@supabase/supabase-js";
import Countdown from "./Countdown";
import Stopwatch from "./Stopwatch";
import Leaderboard from "./Leaderboard";

const DailyChallenge = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB");

  const startTime = secureLocalStorage.getItem("startTime");
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const savedState = secureLocalStorage.getItem("dailyChallengeState") || {
    turnNum: 0,
    attempts: [],
    extraClues: [],
    remainingGuesses: 5,
    movieData: null,
  };

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(
    secureLocalStorage.getItem("showWelcomeScreen") !== false
  );
  const [userdata, setUserdata] = useState(
    secureLocalStorage.getItem("userdata") || { username: "", userHash: "" }
  );
  const [completedToday, setCompletedToday] = useState(
    secureLocalStorage.getItem("completedToday") || false
  );

  const [turnNum, setTurnNum] = useState(savedState?.turnNum);
  const [attempts, setAttempts] = useState(savedState?.attempts);
  const [extraClues, setExtraClues] = useState(savedState?.extraClues);
  const [remainingGuesses, setRemainingGuesses] = useState(
    savedState.remainingGuesses
  );
  const [movieData, setMovieData] = useState(savedState?.movieData);
  const [allMovies, setAllMovies] = useState([]);
  const [completionTime, setCompletionTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [guess, setGuess] = useState("");

  // useEffect(() => {
  //   const checkAndResetStorageForNewDay = () => {
  //     const storedStartTime = secureLocalStorage.getItem("startTime");
  //     const currentDate = new Date();

  //     if (storedStartTime) {
  //       const storedDate = new Date(storedStartTime);

  //       // Compare the year, month, and day to check if it's the same day
  //       if (
  //         storedDate.getFullYear() !== currentDate.getFullYear() ||
  //         storedDate.getMonth() !== currentDate.getMonth() ||
  //         storedDate.getDate() !== currentDate.getDate()
  //       ) {
  //         // Save the username before clearing localStorage
  //         const username = secureLocalStorage.getItem("username");

  //         // Clear storage
  //         secureLocalStorage.clear();

  //         // Restore the username
  //         if (username) {
  //           secureLocalStorage.setItem("username", username);
  //         }
  //       }
  //     }
  //   };

  //   checkAndResetStorageForNewDay();
  // }, []);

  // useEffect(() => {
  //   const checkAndResetStorageForNewDay = () => {
  //     const storedStartTime = secureLocalStorage.getItem("startTime");
  //     const currentDate = new Date();

  //     if (storedStartTime) {
  //       const storedDate = new Date(storedStartTime);

  //       // Compare the year, month, and day to check if it's the same day
  //       if (
  //         storedDate.getFullYear() !== currentDate.getFullYear() ||
  //         storedDate.getMonth() !== currentDate.getMonth() ||
  //         storedDate.getDate() !== currentDate.getDate()
  //       ) {
  //         // Save necessary persistent data before clearing
  //         const username = secureLocalStorage.getItem("username");

  //         // Clear all storage
  //         secureLocalStorage.clear();

  //         // Restore necessary data
  //         if (username) {
  //           secureLocalStorage.setItem("username", username);
  //         }

  //         // Reset the start time for the new day
  //         const newStartTime = currentDate.toISOString();
  //         secureLocalStorage.setItem("startTime", newStartTime);

  //         // Reset relevant state
  //         setCompletedToday(false);
  //         secureLocalStorage.setItem("completedToday", false);

  //         // Reset the saved game state
  //         const initialState = {
  //           turnNum: 0,
  //           attempts: [],
  //           extraClues: [],
  //           remainingGuesses: 5,
  //           movieData: null,
  //         };
  //         secureLocalStorage.setItem("dailyChallengeState", initialState);

  //         // Update React state to reflect new day
  //         setTurnNum(0);
  //         setAttempts([]);
  //         setExtraClues([]);
  //         setRemainingGuesses(5);
  //         setMovieData(null);
  //         setShowWelcomeScreen(true); // Show welcome screen again, if needed
  //       }
  //     }
  //   };

  //   checkAndResetStorageForNewDay();
  // }, []);

useEffect(() => {
  const checkAndResetStorageForNewDay = () => {
    const storedStartTime = secureLocalStorage.getItem("startTime");
    const currentDate = new Date();

    if (storedStartTime) {
      const storedDate = new Date(storedStartTime);

      // Check if it's a new day
      if (
        storedDate.getFullYear() !== currentDate.getFullYear() ||
        storedDate.getMonth() !== currentDate.getMonth() ||
        storedDate.getDate() !== currentDate.getDate()
      ) {
        console.log("New day detected. Resetting local storage and state.");

        // Clear all storage
        secureLocalStorage.clear();

        // Set a new start time for the new day
        const newStartTime = currentDate.toISOString();
        secureLocalStorage.setItem("startTime", newStartTime);

        // Reinitialize local storage with default values
        secureLocalStorage.setItem("completedToday", false);
        secureLocalStorage.setItem(
          "dailyChallengeState",
          JSON.stringify({
            turnNum: 0,
            attempts: [],
            extraClues: [],
            remainingGuesses: 5,
            movieData: null,
          })
        );

        // Reinitialize React state
        setTurnNum(0);
        setAttempts([]);
        setExtraClues([]);
        setRemainingGuesses(5);
        setMovieData(null);
        setCompletedToday(false);
        setShowWelcomeScreen(true); // Optional: show welcome screen again if needed
      }
    } else {
      console.log("No startTime found. Initializing for the first time.");

      // If there's no startTime, initialize it for the first time
      const newStartTime = currentDate.toISOString();
      secureLocalStorage.setItem("startTime", newStartTime);
    }
  };

  checkAndResetStorageForNewDay();
}, []);


  // Save game state
  const saveGameState = () => {
    secureLocalStorage.setItem("dailyChallengeState", {
      turnNum,
      attempts,
      extraClues,
      remainingGuesses,
      movieData,
    });
  };

  // Clear game state
  const clearGameState = () => {
    secureLocalStorage.removeItem("dailyChallengeState");
  };

  // Move to next puzzle or mark challenge complete
  // Move to next puzzle or mark challenge complete
  const handleRefresh = (isGiveUp = false) => {
    if (isGiveUp) {
      toast.warning(
        `You gave up! The correct word was "${movieData.word}" from the movie "${movieData.title}".`
      );
      setCompletedToday(true);
      secureLocalStorage.setItem("completedToday", true);
      secureLocalStorage.setItem("failedToday", true);
      return;
    }

    // Ensure the challenge is marked complete only when all puzzles are solved
    if (turnNum + 1 >= allMovies.length) {
      setCompletedToday(true);
      secureLocalStorage.setItem("completedToday", true);
    } else {
      moveToNextPuzzle();
    }
  };

  const moveToNextPuzzle = () => {
    if (turnNum + 1 >= 5) {
      setCompletedToday(true);
      secureLocalStorage.setItem("completedToday", true);
      return;
    }

    // Directly update `turnNum` to trigger reloading of `movieData`
    setTurnNum((prev) => prev + 1);

    // Reset puzzle-specific state
    setAttempts([]);
    setExtraClues([]);
    setRemainingGuesses(5);
  };

  const fetchPuzzles = async () => {
    try {
      let { data: puzzles, error } = await supabase.from("puzzles").select("*");
      if (error) throw new Error(error.message);

      setAllMovies(puzzles);
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch puzzles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, []);

  useEffect(() => {
    if (allMovies.length > 0) {
      // Validate if the challenge is completed
      if (turnNum >= allMovies.length) {
        setCompletedToday(true);
        secureLocalStorage.setItem("completedToday", true);
        return; // Exit early to prevent setting invalid movie data
      }

      // Load the current movie data for the current puzzle
      const currentMovie = allMovies[turnNum];
      if (currentMovie) {
        setMovieData(currentMovie);
      } else {
        setErrorMessage("Failed to load the puzzle. Please try again later.");
      }
    }
  }, [allMovies, turnNum]);

  useEffect(() => {
    saveGameState();
  }, [turnNum, attempts, extraClues, remainingGuesses, movieData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (remainingGuesses <= 0) {
      toast.warn(`No more guesses left!`);
      setGuess("");
      handleRefresh(true);
      return;
    }

    if (!guess) {
      toast.warn("Please enter a guess!");
      return;
    }

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedWord = movieData.word.toLowerCase();

    if (normalizedGuess === normalizedWord) {
      toast.success(`Well done, ${userdata.username}! Correct answer!`);
      setGuess("");
      if (turnNum + 1 >= 5) {
        handleCompletion();
        setCompletedToday(true);
      } else {
        moveToNextPuzzle();
      }
    } else {
      handleIncorrectGuess();
    }
  };
  const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleIncorrectGuess = () => {
    setGuess(""); // Clear the input
    const newClue =
      extraClues.length < movieData.clues.length
        ? movieData.clues[extraClues.length]
        : "No more clues available.";

    // Display a toast.error immediately
    toast.error("Incorrect guess! Try again.", { autoClose: 2000 });

    // Delay showing the extra clue by 0.5 seconds
    setTimeout(() => {
      setExtraClues((prev) => [...prev, newClue]);
      toast.warn(`Extra Clue: ${newClue}`, { autoClose: 5000 });
      setRemainingGuesses((prev) => prev - 1);
      setAttempts((prev) => [...prev, { guess, clue: newClue }]);
    }, 500);
  };

  // Clear storage at midnight
  const clearStorageAtMidnight = () => {
    const now = new Date();
    const millisecondsUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) -
      now;

    setTimeout(() => {
      secureLocalStorage.clear();
      window.location.reload(); // Reload to ensure new challenge is loaded
    }, millisecondsUntilMidnight);
  };

  useEffect(() => {
    clearStorageAtMidnight();
  }, []);

  const handleWelcomeSubmit = () => {
    const username = userdata.username.trim();
    // remove all whitespaces and spaces in username string
    const trimmedUsername = username.replace(/\s+/g, "");
    const userHash = `${trimmedUsername}_${Math.floor(
      10000000 + Math.random() * 90000000
    )}`;
    const startTime = new Date().toISOString();

    const updatedUserdata = { username, userHash };

    setUserdata(updatedUserdata);
    setShowWelcomeScreen(false);
    secureLocalStorage.setItem("showWelcomeScreen", false);
    secureLocalStorage.setItem("userdata", updatedUserdata);
    secureLocalStorage.setItem("startTime", startTime);
  };

  const handleCompletion = async () => {
    const completionTime = new Date().toISOString();
    const elapsedTimeInSeconds =
      (new Date(completionTime).getTime() -
        new Date(secureLocalStorage.getItem("startTime")).getTime()) /
      1000;
    const elapsedTimeDecimal = elapsedTimeInSeconds / 60;

    // Store completion details
    secureLocalStorage.setItem("completionTime", completionTime);
    secureLocalStorage.setItem("completedToday", true);
    setCompletionTime(completionTime);

    try {
      const { error } = await supabase.from("leaderboard").insert({
        username: userdata.username,
        userHash: userdata.userHash,
        elapsedTime: `${Math.floor(elapsedTimeInSeconds / 60)}:${
          elapsedTimeInSeconds % 60
        }`,
        timeNumeric: elapsedTimeDecimal.toFixed(5),
      });

      if (error) {
        console.error("Error adding to leaderboard:", error.message);
        toast.error("Failed to record time on the leaderboard.");
      } else {
        toast.success("Your time has been recorded on the leaderboard!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    }
  };

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (showWelcomeScreen) {
    return (
      <div className="flex items-start justify-center min-h-screen bg-gray-900 text-white">
        <Card className="p-6 bg-white text-center text-gray-900 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-yellow-500">
            Welcome to the Daily Challenge! <GiPopcorn className="inline" />
          </h1>
          <p className="mb-4 font-medium">
            Solve today's 5 puzzles to complete today’s challenge!
          </p>
          <p className="mb-4 font-medium">
            <FaInfoCircle className="inline text-xl text-blue-900" /> Hurry!
            Complete the challenge in the shortest time possible to appear on
            the daily leaderboard!
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleWelcomeSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <input
              type="text"
              value={userdata?.username}
              onChange={(e) =>
                setUserdata({ ...userdata, username: e.target.value })
              }
              placeholder="Enter your name..."
              className="p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 font-semibold text-center"
              required
            />
            <button
              type="submit"
              className="bg-green-600 font-bold text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Start Playing <FaPlay className="inline ml-1" />
            </button>
            <p className="text-md text-gray-500">Today's challenge ends in:</p>
            <Countdown />
          </form>
        </Card>
      </div>
    );
  }

  if (completedToday) {
    const failedToday = secureLocalStorage.getItem("failedToday");
    if (failedToday) {
      return (
        <div className="flex items-start text-center justify-center min-h-screen bg-gray-900 text-white">
          <Card className="p-6 bg-white text-gray-900 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold mb-4">Daily Challenge Failed</h1>
            <p className="mb-4">
              You gave up on the daily challenge for {formattedDate}.
              <br />
              The correct word was "
              <span className="text-red-600">{movieData?.word}</span>" from the
              movie "<span className="text-blue-600">{movieData?.title}</span>".
            </p>

            <Leaderboard />
            <Countdown />
            <p className="my-4 text-center">Come back tomorrow to try again!</p>
            {/* // Add a button to redirect to main page */}
          </Card>
        </div>
      );
    }

    // Successful completion screen
    return (
      <div className="flex items-start justify-center min-h-screen bg-gray-900 text-white">
        <Card className="p-6 bg-white text-gray-900 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Congratulations, {userdata?.username}!
          </h1>
          <p>
            You’ve successfully completed today’s challenge. See you tomorrow!
          </p>

          {/* Display time taken */}
          {startTime && completionTime && (
            <p className="mt-4 text-lg text-gray-700 font-semibold">
              You completed the challenge in{" "}
              <span className="text-yellow-600 font-bold">
                {formatElapsedTime(
                  (new Date(completionTime).getTime() -
                    new Date(startTime).getTime()) /
                    1000
                )}
              </span>
              !
            </p>
          )}

          <Leaderboard userdata={userdata} />
          <p className="my-4 text-center text-blue-900">
            Share your score with your friends!
          </p>
          <CopyToClipboard
            text={
              window.location.origin +
              `/leaderboard?userhash=${userdata?.userHash}`
            }
            onCopy={() => toast.success("Link copied to clipboard!")}
          >
            <button className="flex items-center text-center justify-center bg-blue-900 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg">
              {userdata?.username}'s Score Link{" "}
              <MdContentCopy className="ml-2 text-xl " />
            </button>
          </CopyToClipboard>

          <Countdown />
          <p className="my-4 text-center">Come back tomorrow to try again!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-2">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white rounded-xl shadow-lg">
          {/* Movie Info Section */}
          <div className="px-4 py-2 text-center">
            {/* Clue Section */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-md">
              <h1 className="text-xl font-bold text-gray-900 italic mb-2">
                Puzzle {turnNum + 1}/{allMovies?.length}
              </h1>
              <p className="text-sm font-bold text-gray-900 italic">
                Clue:{" "}
                <span className="text-yellow-600 font-bold">
                  {movieData?.clue}
                </span>
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-2 italic">
                Try to guess the word! You can get up to 3 extra clues!
                Remaining Guesses:{" "}
                <span className="text-yellow-500">{remainingGuesses}</span>
              </p>
            </div>

            {/* Movie Image Section */}
            <div className="bg-gray-200 h-64 rounded-lg mb-4 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${movieData?.moviedata?.backdrop_path}`}
                alt="Movie Placeholder"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>

          {/* Movie Details */}
          <div className="px-4">
            <div className="flex justify-between flex-wrap mb-6">
              {/* Genre Pills */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Movie Genre(s)
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {movieData?.moviedata?.genres?.map((genre, index) => (
                    <span
                      key={index}
                      className={`${getRandomColor()} px-3 py-1 rounded-full text-xs font-semibold text-gray-900`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Word Length */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Word Length
                </p>
                <p className="text-yellow-600 font-bold">
                  {movieData.word.length} Letters
                </p>
              </div>
            </div>
            {startTime && (
              <div className="mt-4 mx-auto">
                <Stopwatch startTime={startTime} />
              </div>
            )}
            {/* Form Section */}
            <form
              onSubmit={handleSubmit}
              className="w-4/5 mx-auto mt-8 flex justify-center items-center"
            >
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                maxLength={20}
                placeholder="Enter your guess..."
                autoFocus
                className="w-3/5 text-xl text-gray-900 rounded-lg pb-2 border-b-2 focus:border-gray-400"
              />
              <button
                type="submit"
                className="bg-green-600 text-xl font-bold hover:bg-green-700 text-white px-6 py-2 rounded-lg ml-4"
              >
                Check
              </button>
            </form>
          </div>
        </Card>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6 w-full mx-auto">
          {attempts.length > 0 && (
            <div>
              <h3 className="text-lg text-white mb-4">
                Your Attempts ({attempts.length}):{" "}
                {attempts.map((attempt) => `"${attempt.guess}"`).join(", ")}
              </h3>
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <tbody>
                  {attempts.map((attempt, index) => (
                    <tr
                      key={index}
                      className="bg-gray-700 border-b dark:border-gray-600 hover:bg-gray-600"
                    >
                      <td className="px-6 font-medium text-white">
                        Clue #{index + 1}
                      </td>
                      {/* <td className="px-6 py-4 text-yellow-400">
                        {attempt.guess}
                      </td> */}
                      <td className="px-6 py-4 text-yellow-400 italic font-medium">
                        {attempt?.clue || "No clue"}
                      </td>
                    </tr>
                  ))}
                  {attempts.length > 2 && (
                    <tr className="bg-gray-800 border-t dark:border-gray-600 hover:bg-gray-700">
                      <td
                        colSpan="3"
                        className="px-6 py-4 font-semibold text-blue-300 text-center"
                      >
                        The mystery word is from this movie:{" "}
                        <span className="text-white font-bold">
                          {movieData?.title || "Unknown"}{" "}
                          <i>
                            ({movieData?.moviedata?.release_date || "Unknown"})
                          </i>
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            className="bg-red-800 hover:bg-red-600 font-bold text-white px-6 py-3 rounded-lg"
            onClick={() => handleRefresh(true)}
          >
            Give Up Challenge
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default DailyChallenge;
