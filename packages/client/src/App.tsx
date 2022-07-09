import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { GameList } from "./GameList";
import "./App.css";

import io from "socket.io-client";
import { GamePage } from "./GamePage";

const socket = io(`http://${window.location.hostname}:3000`);

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="game/:game_id" element={<GamePage />} />
      </Routes>
    </div>
  );
}

function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, []);

  const sendPing = () => {
    socket.emit("ping");
  };

  return (
    <>
      <main>
        <h2>Welcome to Go variants!</h2>
        <div>
          <hr />
          <h3>socket.io tests...</h3>
          <p>Connected: {"" + isConnected}</p>
          <p>{`Last pong: ${lastPong || "-"}`}</p>
          <button onClick={sendPing}>Send ping</button>
          <hr />
        </div>
      </main>
      <nav>
        <Link to="/about">About</Link>
        <GameList />
      </nav>
    </>
  );
}

function About() {
  return (
    <>
      <main>
        <h2>Who are we?</h2>
        <p>
          <span>Check us out on </span>
          <a href="https://github.com/benjaminpjones/govariants">Github</a>
        </p>
      </main>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </>
  );
}

export default App;
