// src/components/VideoPlayer.js
import React from "react";

const VideoPlayer = ({ videoSrc }) => {
    const getEmbedUrl = (url) => {
        const videoId = url.split("v=")[1] || url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
      };
  return (
    <div style={{textAlign: "center"}}>
      <h2>Video Player</h2>
      <iframe
        width="600"
        height="400"
        src={getEmbedUrl(videoSrc)}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
