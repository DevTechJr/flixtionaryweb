import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Spinner } from "flowbite-react";
import SocialShareButtons from "./SocialShareButtons";
import Social2 from "./Social2";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FullLeaderboard = () => {
  const [searchParams] = useSearchParams();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userdata, setUserdata] = useState(null);

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
        const userHash = searchParams.get("userhash");

        if (userHash) {
          // Find the user's rank in the full leaderboard
          const { data: allScores, error: allScoresError } = await supabase
            .from("leaderboard")
            .select("username, userHash, elapsedTime, timeNumeric")
            .order("timeNumeric", { ascending: true });

          if (allScoresError) throw new Error(allScoresError.message);

          const userIndex = allScores.findIndex(
            (entry) => entry.userHash === userHash
          );

          if (userIndex !== -1) {
            rank = userIndex + 1; // Adjust for 0-based index
            const userEntry = allScores[userIndex];
            setUserdata({
              username: userEntry.username,
              userHash: userEntry.userHash,
            });
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
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto w-3/5 mx-auto rounded-lg">
      <table className="w-full text-sm text-center text-gray-500 dark:text-gray-400">
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
        <tbody className="bg-white dark:bg-gray-800 text-center">
          {leaderboardData.map((entry, index) => (
            <tr
              key={entry.userHash}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 font-medium text-blue-900 whitespace-nowrap dark:text-white">
                {index + 1}
              </td>
              <td className="px-6 py-4 text-blue-900 font-medium">
                {entry.username}
              </td>
              <td className="px-6 py-4 text-blue-900 font-medium">
                {entry.elapsedTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {userdata && userRank && (
        <>
          {leaderboardData.some(
            (entry) => entry.userHash === userdata.userHash
          ) ? (
            <div className="w-full">
              <p className="mt-4 text-center text-green-500 text-md font-bold">
                🎉{userdata.username} ranked #{userRank} in today's daily
                challenge!
              </p>
            </div>
          ) : (
            <>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 font-bold">
                <td className="px-6 py-4">{userRank}</td>
                <td className="px-6 py-4">{userdata.username}</td>
                <td className="px-6 py-4">
                  {leaderboardData[0]?.elapsedTime || "N/A"}
                </td>
              </tr>

              <div className="bg-white px-4 py-2 rounded-lg">
                <p className="mt-4 text-center text-grey-800 text-md font-bold">
                  {userdata.username} is currently ranked #{userRank}!
                </p>
              </div>
            </>
          )}
          <p className="mt-4 text-center text-gray-400 text-sm">
            Challenge your friends to play and beat your time!
          </p>
          <Social2
            username={userdata.username}
            elapsedTime={leaderboardData[0]?.elapsedTime || "N/A"}
            rank={userRank}
          />
        </>
      )}
    </div>
  );
};

export default FullLeaderboard;
