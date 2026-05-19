import React from 'react';
import HeroBanner from '../../ui/HeroBanner';

const GreetingCard = ({ name }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.trim().split(/\s+/)[0];
    };

    const getDailyTagline = () => {
        const taglines = [
            "Your healing unfolds one mindful step at a time.",
            "Small steps, taken consistently, lead to lasting change.",
            "Your body knows how to heal. We're here to guide it.",
            "Every session, a step closer to your best self."
        ];
        const today = new Date();
        const localDay = today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate();
        return taglines[localDay % taglines.length];
    };

    const firstName = getFirstName(name);
    const greeting = `${getGreeting()}, ${firstName}`;

    return (
        <HeroBanner
            title={greeting}
            subtitle={`"${getDailyTagline()}"`}
            label="WELLNESS DASHBOARD"
        />
    );
};

export default GreetingCard;
