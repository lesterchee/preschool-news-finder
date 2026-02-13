'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InterestListProps {
    onTagsChange?: (tags: string[]) => void;
}

export default function InterestList({ onTagsChange }: InterestListProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load tags from localStorage on mount
    useEffect(() => {
        const savedTags = localStorage.getItem('preschool-news-interests');
        if (savedTags) {
            const parsedTags = JSON.parse(savedTags);
            setTags(parsedTags);
            onTagsChange?.(parsedTags);
        }
        setIsLoaded(true);
    }, []);

    // Save tags to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('preschool-news-interests', JSON.stringify(tags));
            onTagsChange?.(tags);
        }
    }, [tags, isLoaded, onTagsChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    if (!isLoaded) {
        return null; // or a loading skeleton
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary">
                Your Interest List 📝
            </h2>

            <div className="mb-6 min-h-[100px] p-6 bg-background rounded-2xl border-2 border-dashed border-secondary/50">
                {tags.length === 0 ? (
                    <p className="text-gray-400 text-center italic mt-4">
                        Type something like "Space" or "Cats" to start your list...
                    </p>
                ) : (
                    <ol className="space-y-3">
                        {tags.map((tag, index) => (
                            <li
                                key={tag}
                                className="flex items-center justify-between p-3 bg-white rounded-xl border border-secondary shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                                        {index + 1}
                                    </span>
                                    <span className="text-lg font-medium text-gray-700">
                                        {tag}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    aria-label={`Remove ${tag}`}
                                >
                                    <X size={18} />
                                </button>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type an interest and press Enter... (e.g., Dinosaurs)"
                    className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
            </div>
        </div>
    );
}
