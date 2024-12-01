import React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";

const SocialShareButtons = ({ username, elapsedTime, rank }) => {
  const shareUrl = window.location.href+"/daily-challenge"; // URL of the leaderboard or challenge
  const message = `I just completed flixtionary's Daily Challenge and ranked #${rank} with a time of ${elapsedTime}! 🚀 \n \n Can you beat my score? \n #flixtionary #fun #games #wordle \n Try now at \n`;

  return (
    <div className="flex gap-4 justify-center mt-6">
      <FacebookShareButton url={shareUrl} quote={message}>
        <FacebookIcon size={40} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={message}>
        <TwitterIcon size={40} round />
      </TwitterShareButton>

      <WhatsappShareButton url={shareUrl} title={message} separator=" - ">
        <WhatsappIcon size={40} round />
      </WhatsappShareButton>

      <LinkedinShareButton url={shareUrl} summary={message}>
        <LinkedinIcon size={40} round />
      </LinkedinShareButton>
    </div>
  );
};

export default SocialShareButtons;
