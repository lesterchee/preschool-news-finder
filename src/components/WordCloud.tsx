'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WordCloudProps {
    onTagsChange?: (tags: string[]) => void;
}

export default function WordCloud({ onTagsChange }: WordCloudProps) {
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
                What do you like? 🎈
            </h2>

            <div className="flex flex-wrap gap-3 mb-6 min-h-[100px] p-4 bg-background rounded-2xl border-2 border-dashed border-secondary/50">
                {tags.length === 0 ? (
                    <p className="text-gray-400 w-full text-center self-center italic">
                        Type something like "Space" or "Cats"...
                    </p>
                ) : (
                    tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-accent text-gray-700 animate-in fade-in zoom-in duration-300"
                        >
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 p-1 hover:bg-white/50 rounded-full transition-colors"
                                aria-label={`Remove ${tag}`}
                            >
                                <X size={16} />
                            </button>
                        </span>
                    ))
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type an interest and press Enter..."
                    className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
            </div>
        </div>
    );
}
