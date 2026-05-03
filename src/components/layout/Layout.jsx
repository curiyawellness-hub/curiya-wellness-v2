import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ children, activeTab, onTabChange, flags }) => {
    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{
                padding: '16px',
                paddingTop: '95px',
                paddingBottom: '10px',
                flex: '1 0 auto',
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                minHeight: 'fit-content'
            }}>
                {children}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} flags={flags} />
        </div>
    );
};

export default Layout;
