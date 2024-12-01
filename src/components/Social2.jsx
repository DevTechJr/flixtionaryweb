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

const Social2 = () => {
  const shareUrl = window.location.href; // URL of the leaderboard or challenge
  const message = `Are you capable of completing flixtionary's Daily Challenge? 🚀 \n Try now @ flixtionary.vercel.app/daily-challenge ! \n #flixtionary #fun #games #wordle`;

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

export default Social2;
