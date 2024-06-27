import React, { useState } from 'react';
import '../../index.css'; // Ensure you import the CSS file correctly

const topics = ['see', 'smell', 'taste', 'hear', 'learn', 'discover'];

const MadLibAnimation: React.FC = () => {
    const [animationEnabled, setAnimationEnabled] = useState(true);

    const toggleAnimation = () => {
        setAnimationEnabled(!animationEnabled);
    };

    return (
        <div className="relative overflow-hidden">
            <h1 className="opacity-100 transform translate-z-0 scale-100 rotate-0 skew-0 transition-transform text-4xl font-bold tracking-tight text-gray-900 m-0 overflow-hidden">
                Investigate rates of <span className="m-0 p-0 inline-block top-[1.2rem] relative w-48 h-12">
                    {animationEnabled ? (
                        topics.map((topic, index) => (
                            <span key={index} className={`absolute bg-white m-0 p-0 topic w-full text-center`}>
                                {topic}
                            </span>
                        ))
                    ) : (
                        <span className="absolute w-full text-center">
                            select a topic
                        </span>
                    )}
                </span> in the United States
            </h1>
            <button
                onClick={toggleAnimation}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
                {animationEnabled ? 'Disable Animation' : 'Enable Animation'}
            </button>
        </div>
    );
};

export default MadLibAnimation;