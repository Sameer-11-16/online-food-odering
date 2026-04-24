import React from 'react';

const Skeleton = ({ width, height, borderRadius, margin, className }) => {
    return (
        <div 
            className={`skeleton-loader ${className || ''}`}
            style={{ 
                width: width || '100%', 
                height: height || '20px', 
                borderRadius: borderRadius || '8px',
                margin: margin || '0'
            }}
        />
    );
};

export const CardSkeleton = () => (
    <div className="glass-panel" style={{ padding: '20px', height: '380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Skeleton height="200px" borderRadius="16px" />
        <Skeleton width="70%" height="24px" />
        <Skeleton width="40%" height="16px" />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="80px" height="20px" />
            <Skeleton width="60px" height="20px" />
        </div>
    </div>
);

export const MenuItemSkeleton = () => (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', borderRadius: '24px' }}>
        <Skeleton width="120px" height="120px" borderRadius="20px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width="60%" height="24px" />
            <Skeleton width="40%" height="18px" />
            <Skeleton width="100%" height="40px" margin="10px 0 0 0" />
        </div>
    </div>
);

export default Skeleton;
