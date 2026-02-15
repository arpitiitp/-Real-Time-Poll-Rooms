import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Loader2, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/polls';

const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const navigate = useNavigate();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || options.some(opt => !opt.trim())) {
            alert('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(API_URL, { question, options });
            navigate(`/poll/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Error creating poll');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in relative overflow-hidden ring-1 ring-white/10">
            {/* Header */}
            <div className="text-center mb-10 relative z-10">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                    <Sparkles size={16} className="mr-2" />
                    <span className="text-xs font-bold tracking-wide uppercase">New Poll</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 tracking-tight">
                    Create a Poll
                </h1>
                <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
                    Ask your community anything, get real-time answers.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {/* Question Section */}
                <div className={`transition-all duration-300 ${focusedInput === 'question' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-sm font-bold text-slate-300 mb-2 ml-1 uppercase tracking-wider">
                        Your Question
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            className="input-field text-lg font-medium bg-slate-950/80 border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-inner"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onFocus={() => setFocusedInput('question')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="e.g., What's the best framework for 2024?"
                            required
                            autoFocus
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">
                        Poll Options
                    </label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 group items-center transition-all duration-300 ${focusedInput === `option-${index}` ? 'transform translate-x-1' : ''}`}
                            >
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold border border-slate-700">
                                        {index + 1}
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-14 bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        onFocus={() => setFocusedInput(`option-${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                </div>

                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20"
                                        aria-label="Remove option"
                                        tabIndex={-1}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className="group flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-1 transition-colors mt-2"
                    >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                        Add another option
                    </button>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn w-full text-lg py-4 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/50"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin" size={22} />
                                Creating Poll...
                            </span>
                        ) : (
                            'Create Poll'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePoll;
