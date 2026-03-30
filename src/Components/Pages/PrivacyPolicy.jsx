import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

function PrivacyPolicy() {
  const [content, setContent] = useState({
    privacyPolicy: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
        const response = await axios.get(`${apiUrl}/legal`);
        if (response.data.success) {
          setContent(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching legal content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <>
     <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Privacy Policy</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/" className="breadcrumb-link">
                                                        Home
                                                    </NavLink>
                                                </li>
                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Privacy Policy
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

      <section className="policy-section">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                 <div className="policy-content">
                    <h6>Privacy Policies</h6>
                        <p className="pb-2" style={{ whiteSpace: 'pre-wrap' }}>
                            {loading ? "Loading..." : (content.privacyPolicy || "Privacy Policy content here...")}
                        </p>
                </div>
                </div>
            </div>
        </div>
      </section>
    </>
  )
}

export default PrivacyPolicy