import React, { useState, useEffect, useRef } from "react";
import secureLocalStorage from "react-secure-storage";
import { Card, Spinner } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button } from "flowbite-react";
import { FaFilm, FaLightbulb, FaGamepad } from "react-icons/fa";
import { GiPopcorn } from "react-icons/gi";

const MovieFetcher = () => {
  const [movieData, setMovieData] = useState(
    () => secureLocalStorage.getItem("movieData") || null
  );
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(!movieData);
  const [errorMessage, setErrorMessage] = useState("");
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(
    () => secureLocalStorage.getItem("attempts") || []
  );
  const [remainingGuesses, setRemainingGuesses] = useState(() =>
    Math.max(0, 5 - attempts.length)
  );
  const [extraClues, setExtraClues] = useState(
    () => secureLocalStorage.getItem("extraClues") || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure guesses cannot go below 0
    if (remainingGuesses <= 0) {
      toast.warn(
        `No more guesses left! The correct word was "${movieData.word}" from the movie "${movieData.title}".`
      );
      setTimeout(() => {
        handleRefresh();
      }, 2000);
      setGuess("");
      return;
    }

    if (!guess) {
      toast.warn("Please enter a guess!");
      return;
    }

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedWord = movieData.word.toLowerCase();

    if (normalizedGuess === normalizedWord) {
      toast.success(
        `Congratulations! You guessed it right! This word was from the movie "${movieData.title}".`
      );
      setGuess("");
      setTimeout(() => {
        handleRefresh();
      }, 2000);
      return;
    }

    if (extraClues.length < 3) {
      generateExtraClue(normalizedWord).then((clue) => {
        const newAttempt = { guess, clue };
        const updatedAttempts = [...attempts, newAttempt];
        const updatedClues = [...extraClues, clue];

        setAttempts(updatedAttempts);
        setExtraClues(updatedClues);
        secureLocalStorage.setItem("attempts", updatedAttempts);
        secureLocalStorage.setItem("extraClues", updatedClues);

        setRemainingGuesses((prev) => Math.max(0, prev - 1));

        toast.error("Incorrect guess! Try again.", {
          autoClose: 700,
        });

        setTimeout(() => {
          toast.info(`Extra clue: ${clue}`);
        }, 500);

        setGuess("");

        // Check if guesses have run out
        if (remainingGuesses - 1 <= 0) {
          toast.warning(
            `No more guesses left! The correct word was "${movieData.word}" from the movie "${movieData.title}".`
          );
          setTimeout(() => {
            handleRefresh();
          }, 2000);
          setGuess("");
        }
      });
    } else {
      // No more extra clues; process guess normally
      setRemainingGuesses((prev) => Math.max(0, prev - 1));
      const newAttempt = { guess };
      const updatedAttempts = [...attempts, newAttempt];

      setAttempts(updatedAttempts);
      secureLocalStorage.setItem("attempts", updatedAttempts);

      // Show warning with remaining guesses
      if (remainingGuesses - 1 <= 0) {
        toast.warning(
          `No more guesses left! The correct word was "${movieData.word}" from the movie "${movieData.title}".`
        );
        setTimeout(() => {
          handleRefresh();
        }, 2000);
      } else {
        toast.warn(
          `No more extra clues available! Remaining guesses: ${
            remainingGuesses - 1
          }`
        );
      }

      setGuess("");
    }
  };

  const generateExtraClue = async (word) => {
    const cluePrompt = `
    You are a clue generator. Create a single extra clue for the word "${word}". 
    Make sure the clue is relevant, unique, and makes guessing the word easier but does not reveal the word directly.
    Avoid repeating any of these clues: ${extraClues.join(", ")}.
    Output the clue as a single, concise sentence.

    Make sure the clue you are generating is COMPLETELY different from the previous clues. The clue should be a single sentence ending with a period. The clue should give the reader a hint to the word. 

    Try to use a new perspective, vocabulary or context to create the clue and differentiate it from the previous clues. Your clue should NOT repeat or paraphrase any of the previous clues or movie plot.
    
    When generating the clue, take into account the context of the movie information below:
    Title: "${movieData?.title}"
    Plot: "${movieData?.overview}"

    `;

    try {
      const clue = await execute(cluePrompt);

      return clue;
    } catch (error) {
      console.error("Error generating clue:", error);
      return "Unable to generate a new clue.";
    }
  };

  const execute = async (prompt) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAIKEY}`,
      };
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 550,
          }),
        }
      );
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate response from OpenAI");
    }
  };

  const fetchMovieData = async () => {
    setLoading(true);
    try {
      const releaseYear = Math.floor(Math.random() * (2024 - 1990 + 1)) + 1990;
      const pageNumber = Math.floor(Math.random() * 3) + 1;
      const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageNumber}&primary_release_year=${releaseYear}&sort_by=popularity.desc&with_original_language=en`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_TMDBKEY}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();
      const randomMovie =
        data.results[Math.floor(Math.random() * data.results.length)];

      // extract id from randomMovie
      const movieId = randomMovie.id;
      // fetch movie details
      const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
      const movieDetailsResponse = await fetch(movieDetailsUrl, options);
      const movieDetailsData = await movieDetailsResponse.json();
      const genres = movieDetailsData.genres.map((genre) => genre.name);

      //       const wordPrompt = `
      // Generate a single word related to this movie:
      // Title: "${randomMovie?.title}"
      // Overview: "${randomMovie?.overview}"
      // Output the word only as a single, lowercase string.`;

      // Generate guessable word
      const wordPrompt = `
            You are a data generator that must output ONLY a string containing a single word. Follow these strict requirements:

            1. Generate exactly one unique word related to the information about the movie.
            2. The word must:
               - Be between 2-10 characters long
               - Contain only letters (no numbers, spaces, or special characters)
               - Be a real, verifiable {type}
               - Be properly capitalized if it is a proper noun
            3. The output must be:
               - A single-line string containing just this one word
               - The word enclosed in double quotes and within square brackets, with no commas or additional elements

            Important rules:
            - No abbreviations
            - No slang or informal terms
            - No compound words with spaces
            - Output must be valid string that can be parsed
            - Only output the string - no explanations or additional text

            Example output format for a single city:
            "Tokyo"

            Generate a valid string containing a single word related to this movie:

            Title: "${randomMovie?.title}"
            Release Date: "${randomMovie?.release_date}"
            Overview: "${randomMovie?.overview}"

            MAKE THE WORD RELATED TO THE MOVIE AND INFORMATION BUT MAKE IT NOT TOO HARD (Medium level difficulty) TO GUESS. THIS IS A FOR A -MEDIUM GUESSING GAME targeted towards teens-adults and kids.
        `; // Your prompt here
      const wordResponse = await execute(wordPrompt);
      const wordArray = JSON.parse(wordResponse); // Parse the response to get a plain array
      const word = wordArray[0]; // Extract the actual word string

      // Generate clue
      const cluePrompt = `
You are a crossword clue generator that must output ONLY a valid string containing a single clue. Using the provided word (${word}), create an engaging, context-aware crossword clue following these strict requirements:
1. Generate exactly ONE clue based on the word: ${word} that:
   - Is a single sentence ending with a period
   - Is between 30-100 characters long
   - Does not contain the movie title or any obvious derivatives
   - Uses proper grammar and punctuation
   - Is specific enough to lead directly to the movie or its defining characteristic
   - Follows standard crossword conventions
   - Can incorporate any relevant markers from {markers} if appropriate
2. The clue must:
   - Be challenging but fair
   - Be factually accurate and directly related to the given movie information
   - Avoid subjective opinions and focus on verifiable details
   - Be written in present tense, unless historical context requires past
   - Be clear, unambiguous, and suitable for general audiences
   - Demonstrate contextual understanding of the movie overview, release date, or notable themes
   - Make sure the clue is not too hard or too easy to guess. It should use the context of the movie information below.

3. Output format:
   - A single valid string with the clue as a string
   - Enclose the clue in double quotes and within square brackets, with no additional elements or comments
Example output format for a single movie clue:
"Set in a galaxy far, far away, this iconic saga redefined space opera."
Convert these requirements into a string containing a single, context-aware clue related to the movie ${randomMovie?.title}, using the provided movie information:
Use the information below for context to create the clue for the word: ${word}

Do not include square brackets around the clue. Just return the clue as a string. Do not add " " on the clue either. Just return it as english text.

{
  "title": "${randomMovie?.title}",
  "release_date": "${randomMovie?.release_date}",
  "overview": "${randomMovie?.overview}"

  THE CLUE Has to be related to this word: ${randomMovie?.word}. The users will use your clue to GUESS this word! The clue should be a single sentence ending with a period. The clue should give the reader a hint to the word.

  THE CLUE must be a NOUN such as a name, word, place, object or thing. You must begin the clue with "This [type of noun] is" and give the remaining clue.

  MAKE SURE TO NOT MENTION THE ACTUAL LITERAL WORD IN THE CLUE. DO NOT INCLUDE AND STATE THE MOVIE TITLE OR THE WORD IN THE CLUE TEXT.
}
`; // Your clue prompt here

      const clue = await execute(cluePrompt);
      // const clueArray = JSON.parse(clue); // Parse the response to get a plain array
      // const clueword = clueArray[0]; // Extract the actual word string

      const movieWithGameData = {
        ...randomMovie,
        word,
        clue,
        genres,
      };

      setMovieData(movieWithGameData);
      secureLocalStorage.setItem("movieData", movieWithGameData);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check session storage to decide whether to show the modal
    const isModalShown = sessionStorage.getItem("modalShown");
    if (!isModalShown) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    // Close the modal and set the session storage flag
    setShowModal(false);
    sessionStorage.setItem("modalShown", "true");
  };

  useEffect(() => {
    if (!movieData) {
      fetchMovieData();
    }
  }, [movieData]);

  const handleRefresh = (isGiveUp = false) => {
    secureLocalStorage.removeItem("movieData");
    secureLocalStorage.removeItem("attempts");
    secureLocalStorage.removeItem("extraClues");

    if (isGiveUp) {
      toast.warning(
        "The correct word was: " +
          '"' +
          movieData.word +
          '"' +
          " from " +
          movieData.title
      );
    }

    setTimeout(() => {
      setAttempts([]);
      setExtraClues([]);
      setRemainingGuesses(5);
      setMovieData(null);
      fetchMovieData();
    }, 2000);
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

  if (errorMessage) {
    return (
      <div className="p-4 text-center text-red-500">Error: {errorMessage}</div>
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
              <p className="text-sm font-bold text-gray-900 italic">
                Clue:{" "}
                <span className="text-yellow-600 font-bold">
                  {movieData.clue}
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
                src={`https://image.tmdb.org/t/p/w500${movieData.backdrop_path}`}
                alt="Movie Placeholder"
                className="rounded-lg shadow-xl"
              />
            </div>
            {attempts.filter((attempt) => attempt.clue).length > 2 && (
              <p className="bg-gray-800 border-t dark:border-gray-600 italic text-sm hover:bg-gray-700">
                  The mystery word is:{" "}
                  <span className="text-white font-bold">
                    {movieData?.title || "Unknown"}
                  </span>
              </p>
            )}
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
                  {movieData.genres?.map((genre, index) => (
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
                className="bg-green-600 text-xl font-bold  hover:bg-green-700 text-white px-6 py-2 rounded-lg ml-4"
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
                  {attempts
                    .filter((attempt) => attempt.clue)
                    .map((attempt, index) => (
                      <tr
                        key={index}
                        className="bg-gray-700 border-b dark:border-gray-600 hover:bg-gray-600"
                      >
                        <td className="px-6  font-medium text-white">
                          Clue #{index + 1}
                        </td>
                        <td className="px-6 py-4 text-yellow-400">
                          {attempt.clue}
                        </td>
                      </tr>
                    ))}
                  {attempts.filter((attempt) => attempt.clue).length > 2 && (
                    <tr className="bg-gray-800 border-t dark:border-gray-600 hover:bg-gray-700">
                      <td
                        colSpan="2"
                        className="px-6 py-4 font-semibold text-blue-300 text-center"
                      >
                        The mystery word is from this movie:{" "}
                        <span className="text-white font-bold">
                          {movieData?.title || "Unknown"}
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
            className="bg-red-800 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
            onClick={() => handleRefresh(true)}
          >
            Give Up
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default MovieFetcher;
