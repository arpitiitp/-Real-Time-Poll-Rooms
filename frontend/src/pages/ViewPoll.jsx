import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/polls';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ViewPoll = () => {
    const { id } = useParams();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votedOptionIndex, setVotedOptionIndex] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check local storage for vote status (simple check)
        const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
        if (votedPolls.includes(id)) {
            setHasVoted(true);

            // Check for specific option vote
            const userVotes = JSON.parse(localStorage.getItem('user_votes') || '{}');
            if (userVotes[id] !== undefined) {
                setVotedOptionIndex(userVotes[id]);
            }
        }

        // Fetch initial poll data
        const fetchPoll = async () => {
            try {
                const res = await axios.get(`${API_URL}/${id}`);
                setPoll(res.data);
                setLoading(false);
            } catch (err) {
                setError('Poll not found');
                setLoading(false);
            }
        };

        fetchPoll();

        // Socket.io connection
        const socket = io(SOCKET_URL);

        socket.emit('joinPoll', id);

        socket.on('voteUpdate', (updatedPoll) => {
            setPoll(updatedPoll);
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const handleVote = async (index) => {
        if (hasVoted) return;

        try {
            await axios.post(`${API_URL}/${id}/vote`, { optionIndex: index });

            // Update local storage
            const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
            if (!votedPolls.includes(id)) {
                votedPolls.push(id);
                localStorage.setItem('voted_polls', JSON.stringify(votedPolls));
            }

            // Store specific vote selection
            const userVotes = JSON.parse(localStorage.getItem('user_votes') || '{}');
            userVotes[id] = index;
            localStorage.setItem('user_votes', JSON.stringify(userVotes));

            setVotedOptionIndex(index);
            setHasVoted(true); // Optimistic UI update
        } catch (err) {
            alert(err.response?.data?.message || 'Error voting');
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        </div>
    );

    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

    return (
        <div className="card relative overflow-hidden ring-1 ring-white/5">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h1 className="text-3xl font-extrabold mb-8 text-center text-white relative z-10 break-words leading-tight">
                {poll.question}
            </h1>

            <div className="space-y-3 relative z-10">
                {poll.options.map((option, index) => {
                    const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                    const isSelected = hasVoted && index === votedOptionIndex;

                    return (
                        <button
                            key={index}
                            onClick={() => !hasVoted && handleVote(index)}
                            disabled={hasVoted}
                            className={`w-full group relative p-4 rounded-xl border overflow-hidden transition-all duration-300 text-left ${hasVoted
                                ? isSelected
                                    ? 'border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500 cursor-default' // Highlight selected
                                    : 'border-slate-800 bg-slate-800/50 cursor-default opacity-50' // Dim others
                                : 'border-slate-700 bg-slate-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5'
                                }`}
                        >
                            {/* Progress Bar Background */}
                            <div
                                className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isSelected
                                    ? 'bg-indigo-500/30'
                                    : hasVoted
                                        ? 'bg-slate-700/20'
                                        : 'bg-indigo-500/10 group-hover:bg-indigo-500/20'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            ></div>

                            <div className="flex justify-between items-center relative z-10">
                                <span className={`font-medium text-lg transition-colors ${isSelected
                                    ? 'text-white'
                                    : !hasVoted
                                        ? 'group-hover:text-indigo-200 text-slate-200'
                                        : 'text-slate-400'
                                    }`}>
                                    {option.text}
                                    {isSelected && <span className="ml-2 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400 font-mono">{option.votes}</span>
                                    <span className={`font-bold w-12 text-right ${isSelected
                                        ? 'text-indigo-300'
                                        : !hasVoted
                                            ? 'text-indigo-400'
                                            : 'text-slate-500'
                                        }`}>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center relative z-10">
                {hasVoted ? (
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-medium text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Vote Submitted
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm mb-6 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Select an option to vote
                    </p>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={copyLink}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all text-sm font-medium border border-slate-700 hover:border-slate-600 group"
                    >
                        {copied ? (
                            <>
                                <svg className="text-emerald-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span className="text-emerald-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="group-hover:text-indigo-400 transition-colors" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Share Poll Link
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPoll;
