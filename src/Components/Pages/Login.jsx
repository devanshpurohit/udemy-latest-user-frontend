import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { login } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const { login: authLogin } = useAuth();
    const [username, setUsername] = useState('');        // Separate state for username
    const [password, setPassword] = useState('');        // Separate state for password
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔍 Login form submitted:', { username, passwordLength: password?.length });
            const result = await login(username, password);
            console.log('🔍 Login result:', result);

            if (result.success) {
                console.log('🔍 Login successful, updating auth context...');
                const user = result.data.user || result.data.data?.user;
                console.log('🔍 User role:', user?.role);
                
                // Update auth context
                authLogin(user);

                // Role-based redirect
                if (user?.role === 'admin') {
                    console.log('🔍 Redirecting admin to dashboard...');
                    navigate('/admin/dashboard');
                } else {
                    console.log('🔍 Redirecting user to dashboard...');
                    navigate('/my-dashboard');
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="row w-100">
                <div className="col-lg-6 d-none d-lg-block">
                    <div className="h-100 d-flex align-items-center justify-content-center">
                        <img 
                            src="/auth_banner.png" 
                            alt="Login Banner" 
                            className="img-fluid rounded-3"
                            style={{ maxHeight: '80vh' }}
                        />
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Welcome Back!</h2>
                                <p className="text-muted">Sign in to your account to continue</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        <FontAwesomeIcon icon={faUser} className="me-2" />
                                        Username or Email
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="username"
                                        name="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username or email"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <FontAwesomeIcon icon={faLock} className="me-2" />
                                        Password
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control form-control-lg"
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="remember"
                                        />
                                        <label className="form-check-label" htmlFor="remember">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link to="/forgot-password" className="text-decoration-none">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Sign In
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="text-decoration-none">
                                            Register here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
