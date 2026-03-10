import React, { useState } from 'react';
import { login } from '../../services/authService';

const TestLogin = () => {
    const [username, setUsername] = useState('testuser');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleTestLogin = async () => {
        setLoading(true);
        setResult('');
        
        console.log('🔍 Test login attempt:', { username, password });
        
        try {
            const loginResult = await login(username, password);
            console.log('🔍 Login result:', loginResult);
            
            if (loginResult.success) {
                setResult('✅ Login successful! Check backend console for token.');
            } else {
                setResult(`❌ Login failed: ${loginResult.error}`);
            }
        } catch (error) {
            console.error('🔍 Login error:', error);
            setResult(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4>Test Login</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Username:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="mb-3">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleTestLogin}
                                    disabled={loading}
                                >
                                    {loading ? 'Testing...' : 'Test Login'}
                                </button>
                            </div>
                            {result && (
                                <div className="alert alert-info">
                                    {result}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestLogin;
