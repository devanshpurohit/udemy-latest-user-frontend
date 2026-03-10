import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdAddAPhoto } from "react-icons/md";
import React, { useState, useEffect } from 'react';
import { getStoredUser, updateProfile } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

function MyAccount() {
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        language: 'English'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Use auth user instead of localStorage
        if (authUser) {
            console.log('MyAccount - FULL AUTH USER:', authUser);
            console.log('MyAccount - Auth user profile image:', authUser.profile?.profileImage);
            console.log('MyAccount - Auth user flat profileImage:', authUser.profileImage);
            setUser(authUser);
            setFormData({
                name: authUser.name || authUser.username || '',
                email: authUser.email || '',
                phone: authUser.phone || '',
                countryCode: authUser.countryCode || '+91',
                language: authUser.language || 'English'
            });
            
            // Set profile image from auth user
            if (authUser.profile?.profileImage) {
                console.log('MyAccount - Raw profile image from auth user:', authUser.profile?.profileImage);
                console.log('MyAccount - Is base64 image?', authUser.profile?.profileImage.startsWith('data:'));
                
                let imageUrl;
                if (authUser.profile?.profileImage.startsWith('data:')) {
                    // It's a base64 image, use as-is
                    imageUrl = authUser.profile?.profileImage;
                } else if (authUser.profile?.profileImage.startsWith('http')) {
                    // It's already a full URL, use as-is
                    imageUrl = authUser.profile?.profileImage;
                } else if (authUser.profile?.profileImage) {
                    // It's a relative path, construct full URL
                    imageUrl = `https://udemy-latest-backend-1.onrender.com${authUser.profile.profileImage}`;
                } else {
                    // No profile image
                    imageUrl = null;
                }
                
                setProfileImage(imageUrl);
                console.log('MyAccount - Set profile image from auth user:', imageUrl);
            } else {
                console.log('MyAccount - No profile image found in auth user, setting default');
                setProfileImage("/avtar.png");
            }
        } else {
            console.log('MyAccount - No auth user found, setting default image');
            setProfileImage("/avtar.png");
        }
    }, [authUser]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage('Image size should be less than 2MB');
                return;
            }
            
            // Compress image using canvas
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions (max 800x800)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 with reduced quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setProfileImage(compressedBase64);
                    setMessage('Image compressed and ready to save');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setMessage('');

        try {
       const updateData = {
    ...formData,
    profile: {
        profileImage: profileImage
    }
};

            const result = await updateProfile(updateData);

            if (result.success) {
                setMessage('Profile updated successfully!');
             setAuthUser(prev => ({
    ...prev,
    ...result.data.user,
    profile: {
        ...prev?.profile,
        ...result.data.user?.profile
    }
}));
                
                // Update profile image state immediately
                if (result.data.user?.profile?.profileImage) {
                    const imageUrl = result.data.user.profile.profileImage.startsWith('data:') 
                        ? result.data.user.profile.profileImage
                        : result.data.user.profile.profileImage.startsWith('http')
                        ? result.data.user.profile.profileImage
                        : `https://udemy-latest-backend-1.onrender.com${result.data.user.profile.profileImage}`;
                    
                    setProfileImage(imageUrl);
                    console.log('MyAccount - Profile image updated from response:', imageUrl);
                }
            } else {
                setMessage(result.message);
            }

        } catch (error) {
            setMessage('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setMessage('');
    };
    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">My Account</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        My Account
                                                    </a>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    My Profile
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="course-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="employee-tabs">
                                <ul
                                    className="nav nav-tabs gap-3 justify-content-center"
                                    id="myTab"
                                    role="tablist"
                                >
                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link active"
                                            id="home-tab"
                                            data-bs-toggle="tab"
                                            href="#home"
                                            role="tab"
                                        >
                                            My Profile
                                        </a>
                                    </li>

                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link"
                                            id="profile-tab"
                                            data-bs-toggle="tab"
                                            href="#profile"
                                            role="tab"
                                        >
                                            Billing Information
                                        </a>
                                    </li>
                                </ul>

                                <div className="employee-tabs">
                                    <div className="tab-content" id="myTabContent">
                                        <div
                                            className="tab-pane fade show active"
                                            id="home"
                                            role="tabpanel"
                                        >
                                            <div className="course-card">
                                                <form onSubmit={handleSubmit}>
                                                    <div className="row">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div>
                                                                <h5 className="inner-title fw-700 mb-0">My Profile</h5>
                                                            </div>

                                                            <div>
                                                                {isEditing ? (
                                                                    <button 
                                                                        type="submit" 
                                                                        className="thm-btn"
                                                                        disabled={loading}
                                                                    >
                                                                        {loading ? 'Saving...' : 'Save'}
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        type="button" 
                                                                        className="edit-profile-btn"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            toggleEdit();
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPencil} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                        </div>

                                                        {message && (
                                                            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} mt-2`}>
                                                                {message}
                                                            </div>
                                                        )}

                                                        <div className="col-lg-12">
                                                            <div className="profile-wrapper">
                                                                <label className="avatar-box">
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/png, image/jpeg" 
                                                                        hidden 
                                                                        onChange={handleImageUpload}
                                                                        disabled={!isEditing}
                                                                    />
     <img 
  src={
    profileImage
      ? profileImage.startsWith("data:")
        ? profileImage
        : `${profileImage}?t=${Date.now()}`
      : "/avtar.png"
  }
  alt="Profile"
  className="avatar-img"
  onError={(e) => {
    console.log("MyAccount - Image load error, trying fallback:", e.target.src);
    e.target.src = "/avtar.png";
  }}
  onLoad={(e) => {
    console.log("MyAccount - Profile image loaded successfully:", e.target.src);
  }}
/>
                                                                    {isEditing && (
                                                                        <span className="camera-icon">
                                                                            <MdAddAPhoto />
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="col-lg-6">
                                                            <div className="custom-frm-bx">
                                                                <input 
                                                                    type="text" 
                                                                    name="name"
                                                                    className="form-control" 
                                                                    placeholder="Enter Full Name"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div className="custom-frm-bx">
                                                                <input 
                                                                    type="email" 
                                                                    name="email"
                                                                    className="form-control" 
                                                                    placeholder="Enter Email Address"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div className="custom-frm-bx">
                                                                <div className="login-custm-bx">
                                                                    <select
                                                                        name="countryCode"
                                                                        value={formData.countryCode}
                                                                        onChange={handleChange}
                                                                        disabled={!isEditing}
                                                                        className="country-code"
                                                                    >
                                                                        <option value="+91">+91</option>
                                                                        <option value="+1">+1</option>
                                                                        <option value="+44">+44</option>
                                                                        <option value="+971">+971</option>
                                                                    </select>
                                                                    <input
                                                                        type="tel"
                                                                        name="phone"
                                                                        value={formData.phone}
                                                                        onChange={handleChange}
                                                                        disabled={!isEditing}
                                                                        placeholder="Mobile Number"
                                                                        className="form-control border-0 px-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <select 
                                                                    name="language"
                                                                    value={formData.language}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="form-select"
                                                                >
                                                                    <option value="English">English</option>
                                                                    <option value="Hindi">Hindi</option>
                                                                    <option value="Spanish">Spanish</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {isEditing && (
                                                            <div className="col-lg-12">
                                                                <div className="mt-2 text-center">
                                                                    <button type="submit" className="thm-btn px-5" disabled={loading}>
                                                                        {loading ? 'Saving...' : 'Save'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        <div
                                            className="tab-pane fade"
                                            id="profile"
                                            role="tabpanel"
                                        >
                                            <div className="course-card">
                                                <form action="">
                                                    <div className="row">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div>
                                                                <h5 className="inner-title fw-700 mb-0">Billing Information</h5>
                                                            </div>

                                                            <div>
                                                                <a href="#" className="edit-profile-btn"> <FontAwesomeIcon icon={faPencil} /> </a>
                                                            </div>

                                                        </div>

                                                        <div className="col-lg-6">
                                                            <div className="custom-frm-bx">
                                                                <input type="text" className="form-control" placeholder="Enter Full Name" />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div className="custom-frm-bx">
                                                                <input type="email" className="form-control" placeholder="Enter Email Address" />
                                                            </div>
                                                        </div>

                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <select name="" id="" className="form-select">
                                                                    <option value="">Country/Regions</option>
                                                                </select>

                                                            </div>

                                                        </div>

                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <input type="text" className="form-control" placeholder="Address(Street Address)" />

                                                            </div>

                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="custom-frm-bx">
                                                                <input type="text" className="form-control" placeholder="Enter City" />

                                                            </div>

                                                        </div>

                                                        <div className="col-lg-4">
                                                            <div className="custom-frm-bx">
                                                                <select name="" id="" className="form-select">
                                                                    <option value="">English</option>
                                                                </select>

                                                            </div>

                                                        </div>

                                                        <div className="col-lg-4">
                                                            <div className="custom-frm-bx">
                                                                <input type="text" className="form-control" placeholder="Enter Zip Code" />

                                                            </div>

                                                        </div>

                                                        <div className="col-lg-12">
                                                            <div className="mt-2 text-center">
                                                                <button className="thm-btn px-5">Saved</button>

                                                            </div>
                                                        </div>



                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default MyAccount;
