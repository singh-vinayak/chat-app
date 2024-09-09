import { Button } from '@chakra-ui/react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import ChatPage from './pages/chatpage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
