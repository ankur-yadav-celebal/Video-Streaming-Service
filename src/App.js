import logo from './logo.svg';
import './App.css';
import Chat from './Chat';
import VideoChat from './VideoChat';
import React, { useEffect, useState, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import VideoStream from './components/VideoStream';
import VideoGrid from './components/VideoGrid';
import ThumbnailGenerator from './components/ThumbnailGenerator';
// import 'video.js/dist/video-js.css';
// import '@videojs/themes/dist/forest/index.css';  // Example: using the "forest" theme
// import '@fortawesome/fontawesome-free/css/all.min.css';


// import ChatMobX from './ChatMobX';

function App() {
  const [videoSrc, setVideoSrc] = useState("https://youtu.be/1loCMNOGKe4"); // Replace with your video URL

  return (
      <div className="App">
          <video autoPlay muted className="background-video">
              <source src="https://cdn.pixabay.com/video/2019/12/07/29942-378294545_large.mp4" type="video/mp4" />
          </video>
      {/* <header className="App-header">
        <p>
          Chat application
        </p>
        <Chat></Chat>
        <VideoChat></VideoChat>
        <ChatMobX></ChatMobX>
      </header> */}
      <div className="App">
              {/*<h1>React Video Streaming App</h1>*/}

              <div className="netflix-title">CODEFLIX</div>
      {/*<VideoPlayer videoSrc={videoSrc} /> */}
      
       <h3>VideoStream</h3>
      <VideoStream videoSrc="https://sachatapp.blob.core.windows.net/containerchatapp/Norway.mp4?sp=r&st=2024-10-17T12:57:59Z&se=2024-11-17T20:57:59Z&sv=2022-11-02&sr=b&sig=jtNsSqWA0Rxs5c8ci6LUbO5kjJMdcHrNbzYejw4mvV0%3D" /> 

      {/*<h3>Video Stream</h3>*/}
      {/*<VideoGrid/>*/}

      
      <h3></h3>

      {/* <h3>Thumbnail Generator</h3> */}
      {/* <ThumbnailGenerator videoUrl="https://sachatapp.blob.core.windows.net/containerchatapp/Norway.mp4?sp=r&st=2024-10-17T12:57:59Z&se=2024-11-17T20:57:59Z&sv=2022-11-02&sr=b&sig=jtNsSqWA0Rxs5c8ci6LUbO5kjJMdcHrNbzYejw4mvV0%3D" thumbnailTime={5} /> */}
    </div>
    </div>
  );
}

export default App;
