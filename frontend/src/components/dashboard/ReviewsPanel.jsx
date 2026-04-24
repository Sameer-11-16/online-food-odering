import { Star } from 'lucide-react';

const ReviewsPanel = ({ restaurant }) => {
    const reviews = restaurant?.reviews || [];
    const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;

    const Stars = ({ rating }) => (
        <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} fill={i <= rating ? '#ffa502' : 'transparent'} color={i <= rating ? '#ffa502' : 'var(--glass-border)'} />
            ))}
        </div>
    );

    const dist = [5, 4, 3, 2, 1].map(n => ({ star: n, count: reviews.filter(r => Math.round(r.rating) === n).length }));

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Customer Reviews</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>What your customers are saying.</p>

            {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <Star size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No reviews yet. Reviews from customers will appear here.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '30px', alignItems: 'center', marginBottom: '30px' }}>
                        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', minWidth: '140px' }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffa502' }}>{avg}</div>
                            <Stars rating={Math.round(avg)} />
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{reviews.length} reviews</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            {dist.map(d => (
                                <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, width: '30px', textAlign: 'right' }}>{d.star}★</span>
                                    <div style={{ flex: 1, height: '8px', background: 'var(--glass-accent)', borderRadius: '4px' }}>
                                        <div style={{ height: '100%', width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%', background: '#ffa502', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', width: '20px' }}>{d.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r, i) => (
                            <div key={i} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, flexShrink: 0 }}>{r.name?.charAt(0) || '?'}</div>
                                        <strong>{r.name || 'Anonymous'}</strong>
                                    </div>
                                    <Stars rating={r.rating} />
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewsPanel;
