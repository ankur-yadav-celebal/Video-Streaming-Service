import logo from './logo.svg';
import './App.css';
import Chat from './Chat';
// import ChatMobX from './ChatMobX';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Chat application
        </p>
        <Chat></Chat>
        {/* <ChatMobX></ChatMobX> */}
      </header>
    </div>
  );
}

export default App;
