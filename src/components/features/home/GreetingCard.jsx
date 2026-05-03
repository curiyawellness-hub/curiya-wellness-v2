import React from 'react';
import HeroBanner from '../../ui/HeroBanner';

const GreetingCard = ({ name, quote }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <HeroBanner
            title={`${getGreeting()}, ${name}`}
            subtitle={quote ? `"${quote}"` : null}
            label="WELLNESS DASHBOARD"
        />
    );
};

export default GreetingCard;
