import React, { useRef, useState } from 'react';

const ThumbnailGenerator = ({ videoUrl, thumbnailTime = 5 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  // Function to capture the thumbnail from the video
  const captureThumbnail = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the frame from the video onto the canvas
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Convert canvas to image URL (base64 format)
    const imageUrl = canvas.toDataURL('image/png');
    setThumbnailUrl(imageUrl);
  };

  // Function to play the video to the specific time for capturing
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    video.currentTime = thumbnailTime;
  };

  return (
    <div>
      <h3>Video Thumbnail Generator</h3>
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={captureThumbnail}
        style={{ display: 'none' }} // hide video element
        muted
        controls
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {thumbnailUrl && (
        <div>
          <h4>Generated Thumbnail:</h4>
          <img src={thumbnailUrl} alt="Video Thumbnail" width="300" />
        </div>
      )}
    </div>
  );
};

export default ThumbnailGenerator;
