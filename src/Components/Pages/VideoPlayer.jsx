import { faChevronLeft, faClose, faLock, faVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useEffect, useRef } from "react";
import { MdQuiz } from "react-icons/md";


function VideoPlayer() {
    const videoRef = useRef(null);
    useEffect(() => {
        videojs(videoRef.current);
    }, []);

    return (
        <>
            <section className="udemy-alert-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-start">
                                <button className="vd-back-btn"> <FontAwesomeIcon icon={faChevronLeft} /> Go back</button>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-center">
                                <p>Make Uber Clone App By Vijay</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-end">
                                <p>Your Progress 0 oof 27(0%)</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            <section className="udemy-play-section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-8 px-0">
                            <div className="custom-video-wrapper no-radius-video">
                                <video
                                    ref={videoRef}
                                    className="video-js vjs-big-play-centered custom-video"
                                    controls
                                    preload="auto"
                                    poster="/course_banner.png" data-bs-toggle="modal" data-bs-target="#videoModal" >

                                    <source src="/nw-intro.mp4" type="video/mp4" />
                                </video>
                            </div>

                              <div className="video-details-content">
                                      <div className="vd-content-space">
                                          <h5>Description</h5>
                                        <p>This video introduces the key concepts covered in this lesson and explains them in a simple, easy-to-understand way. It helps you understand how the topic connects to real-life examples and prepares you for the quiz at the end of the lesson. Watch the full video to complete this lesson and continue your learning progress.</p>
                                      </div>

                                      <div className="vd-content-space">
                                           <h5>What I Will Lean</h5>
                                        <ul className="video-content-list">
                                            <li className="vd-content-item">Have the skills to start making money on the side, as a casual freelancer, or full time as a work-from-home freelancer</li>
                                            <li className="vd-content-item">Easily create a beautiful HTML & CSS website with Bootstrap (that doesn't look like generic Bootstrap websites!)</li>
                                            <li className="vd-content-item">Convert any static HTML & CSS website into a Custom WordPress Theme</li>
                                            <li className="vd-content-item">Have a thorough understanding of utilizing PHP to create WordPress websites & themes</li>
                                        </ul>
                                      </div>


                                      <div className="vd-content-space">
                                           <h5>Requirenments</h5>
                                        <ul className="video-content-list">
                                            <li className="vd-content-item pb-0">Have a basic understanding of HTML, CSS and PHP (all courses I offer)</li>
                                            <li className="vd-content-item pb-0">Proficiency in tools like Premiere Pro / After Effects / Final Cut Pro</li>
                                            <li className="vd-content-item pb-0">Strong sense of timing, storytelling, and visual flow</li>
                                            <li className="vd-content-item pb-0">Ability to meet deadlines and follow creative briefs</li>
                                        </ul>
                                      </div>
                               </div>


                        </div>
                        <div className="col-lg-4 video-player-list">
                            <div className="">
                                <div className="accordion custom-accordion " id="customAccordion">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingOne">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseOne"
                                            aria-expanded="true"
                                            aria-controls="collapseOne"
                                        >
                                            <div className="accordion-title">

                                                <span>
                                                    <b>1. Chapter 1 -</b> How to Download VS Code

                                                    <a href="#" className="preview-btn ms-2">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </a>
                                                </span>

                                                <div className="download-notes-box accordion-actions">
                                                    <button className="udemy-down-btn">Download Notes</button>

                                                </div>

                                            </div>


                                        </button>
                                    </h2>

                                    <div
                                        id="collapseOne"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingOne"
                                        data-bs-parent="#customAccordion"
                                    >
                                        <div className="accordion-body">
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>

                                                <div className="">
                                                    <span className="course-com-title">Completed</span>
                                                </div>
                                            </div>
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>


                                                <div className="">
                                                    <span className="course-time-title">1m</span>
                                                </div>
                                            </div>

                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <MdQuiz className="file-icon" />
                                                        <span>Quiz 1</span>
                                                    </a>
                                                </div>





                                            </div>



                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingTwo">
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseTwo"
                                            aria-expanded="false"
                                            aria-controls="collapseTwo"
                                        >
                                            <div className="accordion-title">
                                                {/* <FaFileAlt className="file-icon" /> */}
                                                <span>

                                                    <b>2. Chapter 2 -</b> How to Download VS Code



                                                    <a href="#" className="preview-btn ms-2">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </a>
                                                </span>
                                            </div>

                                            <div
                                                className="accordion-actions">
                                                <a href="#" className="udemy-down-btn paid-notes-btn">
                                                    Download Notes
                                                </a>
                                            </div>


                                        </button>

                                    </h2>

                                    <div
                                        id="collapseTwo"
                                        className="accordion-collapse collapse"
                                        aria-labelledby="headingTwo"
                                        data-bs-parent="#customAccordion"
                                    >
                                        <div className="accordion-body">
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>

                                                <div className="">
                                                    <span className="course-com-title">Completed</span>
                                                </div>
                                            </div>
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>


                                                <div className="">
                                                    <span className="course-time-title">1m</span>
                                                </div>
                                            </div>

                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <MdQuiz className="file-icon" />
                                                        <span>Quiz 1</span>
                                                    </a>
                                                </div>





                                            </div>

                                        </div>
                                    </div>
                                </div>


                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingThree">
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseThree"
                                            aria-expanded="false"
                                            aria-controls="collapseThree"
                                        >
                                            <div className="accordion-title">

                                                <span>
                                                    <b>3. Chapter 3 -</b> How to Download VS Code
                                                    <a href="#" className="preview-btn ms-2">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </a>
                                                </span>
                                            </div>


                                        </button>
                                    </h2>

                                    <div
                                        id="collapseThree"
                                        className="accordion-collapse collapse"
                                        aria-labelledby="headingThree"
                                        data-bs-parent="#customAccordion"
                                    >
                                        <div className="accordion-body">
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>

                                                <div className="">
                                                    <span className="course-com-title">Completed</span>
                                                </div>
                                            </div>
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>


                                                <div className="">
                                                    <span className="course-time-title">1m</span>
                                                </div>
                                            </div>

                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <MdQuiz className="file-icon" />
                                                        <span>Quiz 1</span>
                                                    </a>
                                                </div>





                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingFour">
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseFour"
                                            aria-expanded="false"
                                            aria-controls="headingFour"
                                        >
                                            <div className="accordion-title">

                                                <span>
                                                    <b>4. Chapter 4 -</b> How to Download VS Code

                                                    <a href="#" className="preview-btn ms-2">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </a>
                                                </span>
                                            </div>


                                        </button>
                                    </h2>

                                    <div
                                        id="collapseFour"
                                        className="accordion-collapse collapse"
                                        aria-labelledby="headingFour"
                                        data-bs-parent="#customAccordion"
                                    >
                                        <div className="accordion-body">
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>

                                                <div className="">
                                                    <span className="course-com-title">Completed</span>
                                                </div>
                                            </div>
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>


                                                <div className="">
                                                    <span className="course-time-title">1m</span>
                                                </div>
                                            </div>

                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <MdQuiz className="file-icon" />
                                                        <span>Quiz 1</span>
                                                    </a>
                                                </div>





                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingFive">
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseFive"
                                            aria-expanded="false"
                                            aria-controls="headingFive"
                                        >
                                            <div className="accordion-title">

                                                <span>
                                                    <b>5. Chapter 5 -</b> How to Download VS Code

                                                    <a href="#" className="preview-btn ms-2">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </a>
                                                </span>
                                            </div>

                                            <div
                                                className="accordion-actions">
                                                <a href="#" className="udemy-down-btn">
                                                    Download
                                                </a>
                                            </div>
                                        </button>
                                    </h2>

                                    <div
                                        id="collapseFive"
                                        className="accordion-collapse collapse"
                                        aria-labelledby="headingFive"
                                        data-bs-parent="#customAccordion"
                                    >
                                        <div className="accordion-body">
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>

                                                <div className="">
                                                    <span className="course-com-title">Completed</span>
                                                </div>
                                            </div>
                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                        <span>How to Download VS Code</span>
                                                    </a>
                                                </div>


                                                <div className="">
                                                    <span className="course-time-title">1m</span>
                                                </div>
                                            </div>

                                            <div className="quiz-card">
                                                <div>
                                                    <a href="#" className="quiz-title">
                                                        <MdQuiz className="file-icon" />
                                                        <span>Quiz 1</span>
                                                    </a>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                    </div>
                </div>


            </section>



            {/* payment Successful Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#videoModal" */}
            <div className="modal step-modal fade" id="videoModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box success-modal">
                         <div className="text-end">
                           <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                 <FontAwesomeIcon icon={faClose} />
                             </button>
                        </div>

                        <div className="optional-content-box px-3">
                            <h3>Optional Questions</h3>
                        </div>

                        <div className="modal-body px-3">
                            <div className="row ">
                                <div className="col-lg-12">
                                   <div className="video-optional-content">
                                    <h6>What is Frontend Development?</h6>

                                    <div className="zx-radio-group">
  
                                <label className="zx-radio-card">
                                    <input type="radio" name="plan" />
                                    <span className="zx-radio-ui"></span>
                                    <span className="zx-radio-text">Development of server-side logic and databases</span>
                                </label>

                                <label className="zx-radio-card">
                                    <input type="radio" name="plan" />
                                    <span className="zx-radio-ui"></span>
                                    <span className="zx-radio-text">Development of server-side logic and databases</span>
                                </label>

                                <label className="zx-radio-card">
                                    <input type="radio" name="plan" />
                                    <span className="zx-radio-ui"></span>
                                    <span className="zx-radio-text">Development of server-side logic and databases</span>
                                </label>
                                <label className="zx-radio-card">
                                    <input type="radio" name="plan" />
                                    <span className="zx-radio-ui"></span>
                                    <span className="zx-radio-text">Development of server-side logic and databases</span>
                                </label>
                                </div>
                                   </div>

                                </div>


                                <div className="d-flex align-items-center gap-3 justify-content-end mt-3">
                                    <button className="skip-btn">Skip for now</button>
                                    <button className="thm-btn px-4" data-bs-dismiss="modal" aria-label="Close">Submit</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  payment Successful Popup End */}
        </>
    )
}

export default VideoPlayer