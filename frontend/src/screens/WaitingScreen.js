import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitingScreen.css';

function WaitingScreen() {
    const [status, setStatus] = useState('waiting_for_opponent');
    const [debug, setDebug] = useState('');
    const navigate = useNavigate();
    const isMounted = useRef(true);

    useEffect(() => {
        // Set isMounted to false when the component unmounts
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const pollMatchmaking = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('/api/matchmaking/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const raw = await response.text();
                console.log('Match raw ->', raw);
                let body = {};
                try {
                    body = raw ? JSON.parse(raw) : {};
                } catch (err) {
                    console.warn('Could not parse JSON, carrying on');
                }

                // Always check for an active duel after each poll regardless of body
                const checkActiveDuel = async () => {
                    try {
                        const listResp = await fetch('/api/duels/', {
                            headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (!listResp.ok) return null;
                        const duels = await listResp.json();
                        return duels.find(d => d.status === 'active');
                    } catch (err) {
                        console.error('Active duel lookup failed:', err);
                        return null;
                    }
                };

                let duelId = body.id;
                if (!duelId && (response.status === 200 || response.status === 201)) {
                    const active = await checkActiveDuel();
                    duelId = active ? active.id : null;
                }

                if (duelId) {
                    window.location.href = `/game/${duelId}`;
                    return;
                }

                // Update debug info for 202 (waiting) state
                if (response.status === 202) {
                    setDebug(`Waiting... queue pos ${body.queue_position || '?'} / size ${body.queue_size || '?'}`);
                } else if (!duelId) {
                    setDebug(`Still no duel. Resp ${response.status}`);
                }
            } catch (error) {
                if (isMounted.current) {
                    setDebug('Polling error: ' + error);
                }
            }
        };

        const intervalId = setInterval(() => {
            // Stop polling if a match is found
            if (status === 'waiting_for_opponent') {
                pollMatchmaking();
            }
        }, 3000);

        // Clear interval when the component unmounts or status changes
        return () => clearInterval(intervalId);
    }, [navigate, status]);

    const handleCancel = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/matchmaking/cancel/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setDebug(`Cancel: ${data.status}`);
            setStatus('cancelled');
            setTimeout(() => navigate('/main-menu'), 1000);
        } catch (err) {
            setDebug('Cancel error: ' + err);
        }
    };

    return (
        <div className="waiting-container">
            {status === 'waiting_for_opponent' ? (
                <>
                    <h1>Waiting for opponent...</h1>
                    <div className="spinner"></div>
                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </>
            ) : status === 'match_found' ? (
                <h1>Match Found!</h1>
            ) : status === 'cancelled' ? (
                <h1>Cancelled</h1>
            ) : null}
            <div className="debug-info">{debug}</div>
        </div>
    );
}

export default WaitingScreen; 