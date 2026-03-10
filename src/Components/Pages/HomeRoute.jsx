import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Home from './Home';
import HomeSecond from './HomeSecond';
import Login from './Login';
import Register from './Register';

const HomeRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Home />;
    }

    return <HomeSecond />;
};

export default HomeRoute;
