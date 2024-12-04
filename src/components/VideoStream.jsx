import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/forest/index.css';  // Using the "forest" theme for an enhanced UI
import '@fortawesome/fontawesome-free/css/all.min.css';  // For custom icons
import '@videojs/http-streaming'; // Import HTTP Streaming for HLS
//import 'videojs-hls-quality-selector';

const VideoStream = ({ videoSrc }) => {
    videoSrc = 'https://videostreamapp.blob.core.windows.net/encryptedvideostreamappcontainer/master.M3U8?sp=r&st=2024-11-12T09:19:29Z&se=2025-01-31T17:19:29Z&sv=2022-11-02&sr=c&sig=luD4Z9UjClc3WfcpG0UCuzeOHoWAvheoUZO0Gps5MLQ%3D';
        //'https://videostreamapp.blob.core.windows.net/videostreamappcontainer/master.M3U8?sp=r&st=2024-11-06T10:19:55Z&se=2024-12-30T18:19:55Z&sv=2022-11-02&sr=c&sig=1h2WqnsyiNXji8m0fnq1xR7hmEl6pu3P1%2FT2v%2FtVi%2Bs%3D';
    //'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const videoRef = useRef(null);

  useEffect(() => {
    const player = videojs(videoRef.current, {
      autoplay: false,
      controls: true,
      controlBar: {
        volumePanel: {
          inline: true
        },
      },
      sources: [
        {
          src: videoSrc,
          type: 'application/x-mpegURL',//'video/mp4',  // Ensure the video format is supported
        },
      ],
    });

      const detectDevTools = () => {
          const threshold = 1;
          if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
              console.log("Possible dev tools open or screen recording active.");
          }
      };

      window.addEventListener('resize', detectDevTools);

      // Blur effect for screen recording deterrent
      const handleBlur = () => videoRef.current.style.filter = 'blur(30px)';
      const handleFocus = () => videoRef.current.style.filter = 'none';

      videoRef.current.addEventListener('blur', handleBlur);
      videoRef.current.addEventListener('focus', handleFocus);



    // Additional customization of control bar icons can be done here.
    player.ready(() => {
        // You can customize controls or add additional icons here
        
    });

      //player.on('loadedmetadata', () => {
      //    player.hlsQualitySelector({
      //        displayCurrentQuality: false,
      //    });
      //    const levels = player.qualityLevels();
      //    console.log('Available quality levels:', levels[0].label);

      //    levels.on('addqualitylevel', function (event) {
      //        const qualityLevel = event.qualityLevel;
      //        const { width, height, bitrate } = qualityLevel;

      //        // Customize the label based on resolution or bitrate
      //        if (width && height) {
      //            qualityLevel.label = `${width}x${height}`; // e.g., "1280x720"
      //        } else if (bitrate) {
      //            qualityLevel.label = `${(bitrate / 1000).toFixed(0)} kbps`; // e.g., "2500 kbps"
      //        } else {
      //            qualityLevel.label = "Auto"; // Default label
      //        }

      //        console.log(`Added quality level: ${qualityLevel.label}`);
      //    });

      //});

    // return () => {
    //   if (player) {
    //     player.dispose();
    //   }
    // };
  }, [videoSrc]);

  return (
    <div>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-theme-forest vjs-big-play-centered"
          controls
          preload="none"
          width="640"
          height="360"
        // autoFocus="true"
        // autoSave='false'
        // muted
        />
      </div>
    </div>
  );
};

export default VideoStream;
