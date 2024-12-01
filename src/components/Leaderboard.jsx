import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createClient } from "@supabase/supabase-js";
import { Spinner } from "flowbite-react";
import SocialShareButtons from "./SocialShareButtons";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Leaderboard = ({ userdata }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top 10 scores ordered by `timeNumeric`
        const { data: topScores, error: topScoresError } = await supabase
          .from("leaderboard")
          .select("*")
          .order("timeNumeric", { ascending: true })
          .limit(10);

        if (topScoresError) throw new Error(topScoresError.message);

        let rank = null;

        if (userdata && userdata.userHash) {
          // Find the user's rank in the full leaderboard
          const { data: allScores, error: allScoresError } = await supabase
            .from("leaderboard")
            .select("username, userHash, elapsedTime, timeNumeric")
            .order("timeNumeric", { ascending: true });

          if (allScoresError) throw new Error(allScoresError.message);

          const userIndex = allScores.findIndex(
            (entry) => entry.userHash === userdata.userHash
          );

          if (userIndex !== -1) {
            rank = userIndex + 1; // Adjust for 0-based index
          }
        }

        setLeaderboardData(topScores);
        setUserRank(rank);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userdata]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Rank
            </th>
            <th scope="col" className="px-6 py-3">
              Username
            </th>
            <th scope="col" className="px-6 py-3">
              Elapsed Time
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((entry, index) => (
            <tr
              key={entry.userHash}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {index + 1}
              </td>
              <td className="px-6 py-4">{entry.username}</td>
              <td className="px-6 py-4">{entry.elapsedTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add user-specific row if `userdata` is passed */}
      {userdata && userdata.userHash && userRank && (
        <>
          {/* User is in the top 10 */}
          {leaderboardData.some(
            (entry) => entry.userHash === userdata.userHash
          ) ? (
            <div className="w-full">
              <div className="bg-white px-4 py-2 rounded-lg">
                <p className="mt-4 text-center text-green-500 text-md font-bold">
                  🎉 Congratulations, {userdata.username}! You are ranked #
                  {userRank}!
                </p>
              </div>
            </div>
          ) : (
            <caption className="mt-4 text-center text-yellow-500 text-md">
              You are currently ranked #{userRank}.
            </caption>
          )}
        </>
      )}
      {userdata && userdata.userHash && userRank && (
        <SocialShareButtons
          username={userdata.username}
          elapsedTime={leaderboardData[0]?.elapsedTime || "N/A"}
          rank={userRank}
        />
      )}
    </div>
  );
};

Leaderboard.propTypes = {
  userdata: PropTypes.shape({
    username: PropTypes.string.isRequired,
    userHash: PropTypes.string.isRequired,
  }),
};

export default Leaderboard;
