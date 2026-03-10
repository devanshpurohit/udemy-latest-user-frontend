import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash, faEnvelope, faLock, faUserPlus, faPhone, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { register, login } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState({
        username: '',        // Changed from 'name' to 'username'
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.username || formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                username: formData.username,    // Changed from 'name' to 'username'
                email: formData.email,
                password: formData.password,
            });
            
            if (result.success) {
                console.log('🔍 Registration successful, checking user role...');
                const user = result.data.user || result.data.data?.user;
                console.log('🔍 Registered user role:', user?.role);
                
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
                            alt="Register Banner" 
                            className="img-fluid rounded-3"
                            style={{ maxHeight: '80vh' }}
                        />
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-success">Create Account</h2>
                                <p className="text-muted">Join us today and start learning</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        <FontAwesomeIcon icon={faUser} className="me-2" />
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">
                                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control form-control-lg"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
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
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create a password"
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

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        <FontAwesomeIcon icon={faLock} className="me-2" />
                                        Confirm Password
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-control form-control-lg"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="terms"
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="terms">
                                            I agree to the <Link to="/terms" className="text-decoration-none">Terms and Conditions</Link> and <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success btn-lg w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                            Sign Up
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="mb-0">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-success text-decoration-none">
                                            Sign In
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

export default Register;
