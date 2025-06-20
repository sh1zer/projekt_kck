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

                // Prefer the built-in JSON parser – this will throw if the
                // payload is not valid JSON, allowing us to surface a clear
                // error message instead of silently swallowing it.
                let body = {};
                try {
                    body = await response.clone().json();
                } catch (e) {
                    const raw = await response.text();
                    setDebug(`Failed to parse JSON: ${e}, Raw: ${raw}`);
                    console.error('Failed to parse matchmaking response', e, raw);
                }
                console.log('Matchmaking response body:', body);

                // Only process the response if the component is still mounted
                if (!isMounted.current) return;

                setDebug(`Status: ${response.status}, ok: ${response.ok}, Body: ${JSON.stringify(body)}`);
                console.log('🧐 evaluate success', { status: response.status, ok: response.ok, hasId: !!body.id });
                if (response.ok && body && body.id) {
                    setStatus('match_found');
                    if (isMounted.current) {
                        const targetPath = `/game/${body.id}`;
                        console.log('🚀 Navigating to', targetPath);
                        // Primary navigation via React Router
                        navigate(targetPath);
                        // Fallback in case React Router navigation fails (e.g. due to
                        // being in a different router context in dev or HMR glitches).
                        setTimeout(() => {
                            if (window.location.pathname !== targetPath) {
                                console.warn('React-Router navigation did not change URL, forcing hard redirect.');
                                window.location.href = targetPath;
                            }
                        }, 100);
                    }
                } else if (response.status !== 202) {
                    setDebug(`Error matchmaking: ${response.status}, Body: ${JSON.stringify(body)}`);
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