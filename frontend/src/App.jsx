import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll';
import ViewPoll from './pages/ViewPoll';
import './index.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Routes>
                    <Route path="/" element={<CreatePoll />} />
                    <Route path="/poll/:id" element={<ViewPoll />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
