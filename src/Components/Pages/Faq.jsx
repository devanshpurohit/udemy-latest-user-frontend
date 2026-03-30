import { NavLink } from "react-router-dom"
import React, { useState, useEffect, useRef } from 'react';
import { createQuestion, getMyQuestions, getQuestionsPublic, isAuthenticated } from '../../services/apiService';
import { getBackendBaseUrl } from '../../config/backendConfig';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaSpinner, FaQuestionCircle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

function Faq() {
  const { user } = useAuth();
  const [publicFaqs, setPublicFaqs] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [showAllGeneral, setShowAllGeneral] = useState(false);
  const isUserLoggedIn = !!user;
  
  const socket = useSocket();

  useEffect(() => {
    loadData();
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (socket && user) {
      console.log('🔗 Attaching FAQ listeners to global socket');
      
      const handleAnswer = (updatedQuestion) => {
        console.log('📨 Answer received via global socket:', updatedQuestion);
        
        // Update my questions list if the question belongs to current user
        setMyQuestions(prev => prev.map(q => 
          q._id === updatedQuestion._id ? updatedQuestion : q
        ));

        // Also update public FAQ if it was marked public
        if (updatedQuestion.isPublic) {
          setPublicFaqs(prev => {
            const exists = prev.some(q => q._id === updatedQuestion._id);
            if (exists) {
              return prev.map(q => q._id === updatedQuestion._id ? updatedQuestion : q);
            }
            return [updatedQuestion, ...prev];
          });
        }
      };

      const handleChatMessage = (payload) => {
        console.log('💬 Chat message received for sync:', payload);
        // payload: { _id, text, sender, conversationId, createdAt }
        
        const myId = (user._id || user.id).toString();
        const msgSenderId = (payload.sender?._id || payload.sender || '').toString();

        if (msgSenderId !== myId) {
          // If it's an answer (from someone else), update the pending chat question in myQuestions
          setMyQuestions(prev => prev.map(q => {
            if (q.isChat && q.status === 'pending') {
               // In current sync logic, we assume the latest pending chat question gets this answer
               return { ...q, answer: payload.text, status: 'answered' };
            }
            return q;
          }));
        } else {
          // If it's a new user question from chat, add it to the list
          const newChatQ = {
            _id: payload._id,
            question: payload.text,
            answer: null,
            status: 'pending',
            createdAt: payload.createdAt,
            isChat: true
          };
          setMyQuestions(prev => [newChatQ, ...prev]);
        }
      };

      socket.on('answer_received', handleAnswer);
      socket.on('receiveMessage', handleChatMessage);

      return () => {
        socket.off('answer_received', handleAnswer);
        socket.off('receiveMessage', handleChatMessage);
      };
    }
  }, [socket, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const publicRes = await getQuestionsPublic(false);
      if (publicRes.success) setPublicFaqs(publicRes.data);
      
      if (isUserLoggedIn) {
        const myRes = await getMyQuestions();
        if (myRes.success) {
           console.log("Fetched my questions (including chat):", myRes.data);
           setMyQuestions(myRes.data);
        }
      }
    } catch (error) {
      console.error("Error loading FAQ data:", error);
    } finally {
      setLoading(false);
    }
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
                  <h3 className="lg_title text-center mb-2">FAQ & Help Center</h3>
                  <div className="admin-breadcrumb">
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb custom-breadcrumb">
                        <li className="breadcrumb-item">
                          <NavLink to="/" className="breadcrumb-link">Home</NavLink>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">FAQ</li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='faq-section py-5'>
        <div className="container">
          <div className="row">
            {/* FAQ List */}
            <div className="col-lg-12">
              <div className='udemy-learn-content mb-4'>
                <h5> Frequently <span className='top-learn-title'> Asked Questions </span> </h5>
                <p className="text-muted">Quick answers to the questions you may have.</p>
              </div>

              {/* Category Filter */}
              <div className="category-filter mb-4 d-flex flex-wrap gap-2">
                {["All", ...new Set(publicFaqs.map(f => f.category || "General"))].map(cat => (
                  <button
                    key={cat}
                    className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowAllGeneral(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className='faq-cards'>
                <div className="accordion zx-faq-accordion" id="zxFaq">
                  {publicFaqs.length > 0 ? (
                    (() => {
                      const filtered = publicFaqs.filter(faq => selectedCategory === "All" || (faq.category || "General") === selectedCategory);
                      const displayItems = (selectedCategory === "General" && !showAllGeneral) 
                        ? filtered.slice(0, 10) 
                        : filtered;
                      
                      return (
                        <>
                          {displayItems.map((faq, index) => (
                            <div className="accordion-item mb-3 border rounded shadow-sm" key={faq._id}>
                              <h2 className="accordion-header" id={`heading${index}`}>
                                <button 
                                  className={`accordion-button zx-faq-btn ${index !== 0 ? 'collapsed' : ''}`}
                                  type="button" 
                                  data-bs-toggle="collapse" 
                                  data-bs-target={`#collapse${index}`} 
                                  aria-expanded={index === 0 ? "true" : "false"}
                                >
                                  {faq.question}
                                </button>
                              </h2>
                              <div 
                                id={`collapse${index}`} 
                                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                                data-bs-parent="#zxFaq"
                              >
                                <div className="accordion-body text-secondary">
                                  {faq.answer}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {selectedCategory === "General" && !showAllGeneral && filtered.length > 10 && (
                            <div className="text-center mt-4">
                              <button 
                                className="btn btn-primary rounded-pill px-4"
                                onClick={() => setShowAllGeneral(true)}
                              >
                                View More FAQ
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <>
                      {/* Hardcoded defaults if no public FAQs in DB yet */}
                      <div className="accordion-item mb-3 border rounded shadow-sm">
                        <h2 className="accordion-header" id="headingOne">
                          <button className="accordion-button zx-faq-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                            Who is this course designed for?
                          </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#zxFaq">
                          <div className="accordion-body">
                            Our courses are designed for students, professionals, and anyone looking to enhance their skills in modern technologies.
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item mb-3 border rounded shadow-sm">
                        <h2 className="accordion-header" id="headingTwo">
                          <button className="accordion-button collapsed zx-faq-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                            How do I get my certificate?
                          </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#zxFaq">
                          <div className="accordion-body">
                            Once you complete all lessons in a course, your certificate will be automatically generated in your dashboard.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* My Questions Section */}
              {isUserLoggedIn && (
                <div className="mt-5">
                  <div className='udemy-learn-content mb-4'>
                    <h5> My <span className='top-learn-title'> Questions </span> </h5>
                    <p className="text-muted">Track the status of your queries in real-time.</p>
                  </div>
                  
                  <div className="row g-3">
                    {myQuestions.length > 0 ? (
                      myQuestions.slice(0, 4).map((q) => (
                        <div className="col-12" key={q._id}>
                          <div className="card border-0 shadow-sm p-3 rounded-4 bg-light h-100">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-2">
                              <div className="d-flex gap-3 align-items-start">
                                <div className="p-2 bg-primary-subtle text-primary rounded-circle flex-shrink-0" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaQuestionCircle />
                                </div>
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <h6 className="mb-0 text-dark fw-bold" style={{ lineHeight: '1.4' }}>
                                      {q.question}
                                    </h6>
                                    {q.isChat && (
                                      <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '10px' }}>Live Chat</span>
                                    )}
                                  </div>
                                  <small className="text-muted d-block">{new Date(q.createdAt).toLocaleDateString()}</small>
                                </div>
                              </div>
                              <span className={`badge rounded-pill flex-shrink-0 px-3 py-2 ${q.status === 'answered' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning border border-warning'}`}>
                                {q.status === 'answered' ? <><FaCheckCircle className="me-1" /> Answered</> : <><FaClock className="me-1" /> Pending</>}
                              </span>
                            </div>
                            {q.answer ? (
                              <div className="mt-2 p-3 bg-white rounded-3 border-start border-4 border-success">
                                <p className="mb-0 text-secondary" style={{ lineHeight: '1.6', fontSize: '14px' }}>{q.answer}</p>
                              </div>
                            ) : (
                              <div className="mt-2 p-2 bg-white-50 rounded-3">
                                <p className="small text-muted mb-0 fst-italic">Waiting for admin to respond...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-4 bg-light rounded-4">
                        <p className="text-muted mb-0">You haven't asked any questions yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Faq