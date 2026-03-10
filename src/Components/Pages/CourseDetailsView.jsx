import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useEffect, useRef } from "react";

import { MdWork } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { IoSpeedometer } from "react-icons/io5";
import { IoLanguage } from "react-icons/io5";
import { PiCertificateFill } from "react-icons/pi";
import { MdQuiz } from "react-icons/md";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";
import { MdDesktopWindows } from "react-icons/md";
import { IoMdVideocam } from "react-icons/io";
import { PiCardsThreeFill } from "react-icons/pi";
import { faLock, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdSort } from "react-icons/md";
import { IoIosStar } from "react-icons/io";
import { IoIosStarOutline } from "react-icons/io";
import { NavLink } from "react-router-dom";





function CourseDetailsView() {
    const videoRef = useRef(null);

    useEffect(() => {
        videojs(videoRef.current);
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
                                    <h3 className="lg_title text-center mb-2">Course</h3>
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
                                                        Course
                                                    </a>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Details
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
                    <div className="row">
                        <div className="col-lg-8 mb-2">
                            <div className="course-card">
                                <div className="udemy-thumb-video">
                                    <div className="custom-video-wrapper">
                                        <video
                                            ref={videoRef}
                                            className="video-js vjs-big-play-centered custom-video"
                                            controls
                                            preload="auto"
                                            poster="/course_banner.png"
                                        >
                                            <source src="/nw-intro.mp4" type="video/mp4" />
                                        </video>
                                    </div>

                                    <div className="udemy-content-video">
                                        <h5>Make UBER Clone APP By Vjay</h5>

                                        <p>Posted 1 Day ago</p>
                                    </div>
                                </div>

                                <div className="employee-tabs ">
                                    <ul
                                        className="nav nav-tabs gap-3 justify-content-start mb-2"
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
                                                Description
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link nw-nav-link"
                                                id="profile-tab"
                                                data-bs-toggle="tab"
                                                href="#profile"
                                                role="tab"
                                            >
                                                Course Curriculum
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link nw-nav-link"
                                                id="profile-tab"
                                                data-bs-toggle="tab"
                                                href="#review"
                                                role="tab"
                                            >
                                                Review
                                            </a>
                                        </li>
                                    </ul>


                                    <div className="employee-tabs payment-tp-border">
                                        <div className="tab-content" id="myTabContent">
                                            <div
                                                className="tab-pane fade show active"
                                                id="home"
                                                role="tabpanel"
                                            >
                                                <div className="udemy-description">
                                                    <h6 className="first_para">Descriptions</h6>
                                                    <p>
                                                        This video introduces the key concepts covered in
                                                        this lesson and explains them in a simple,
                                                        easy-to-understand way. It helps you understand how
                                                        the topic connects to real-life examples and
                                                        prepares you for the quiz at the end of the lesson.
                                                        Watch the full video to complete this lesson and
                                                        continue your learning progress.
                                                    </p>
                                                </div>

                                                <div className="udemy-description">
                                                    <h6 className="first_para">What I Will Lean</h6>
                                                    <ul className="ud-description-list">
                                                        <li className="ud-item">
                                                            Have the skills to start making money on the side,
                                                            as a casual freelancer, or full time as a
                                                            work-from-home freelancer
                                                        </li>
                                                        <li className="ud-item">
                                                            Easily create a beautiful HTML & CSS website with
                                                            Bootstrap (that doesn't look like generic
                                                            Bootstrap websites!)
                                                        </li>
                                                        <li className="ud-item">
                                                            Convert any static HTML & CSS website into a
                                                            Custom WordPress Theme
                                                        </li>
                                                        <li className="ud-item">
                                                            Have a thorough understanding of utilizing PHP to
                                                            create WordPress websites & themes
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="udemy-description">
                                                    <h6 className="first_para">Requirenments</h6>
                                                    <ul className="ud-description-list">
                                                        <li className="ud-item pb-0">
                                                            Have a basic understanding of HTML, CSS and PHP
                                                            (all courses I offer)
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Proficiency in tools like Premiere Pro / After
                                                            Effects / Final Cut Pro
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Strong sense of timing, storytelling, and visual
                                                            flow
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Ability to meet deadlines and follow creative
                                                            briefs
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="payment-tp-border"></div>

                                                <div className="about-job-box">
                                                    <h6 className="first_para">About the job</h6>
                                                    <div className="bid-job-main-box">
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <IoSpeedometer />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Course Level</p>
                                                                <h6>Expert</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <FaClock />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p>Availability</p>
                                                                <h6>Lifetime</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <IoLanguage />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p>Language</p>
                                                                <h6>English</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <MdWork />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Lesson</p>
                                                                <h6>153</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <MdQuiz />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Quizs</p>
                                                                <h6>5</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">

                                                                <PiCertificateFill />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Certificate</p>
                                                                <h6>Yes</h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="payment-tp-border"></div>
                                                <div className="about-job-box">
                                                    <h6 className="first_para">Related Tags</h6>

                                                    <ul className="category-list">
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                className="category-nav"
                                                            >
                                                                Web design
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                className="category-nav"
                                                            >
                                                                Web design
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                className="category-nav"
                                                            >
                                                                Web design
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                className="category-nav"
                                                            >
                                                                Web design
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="payment-tp-border"></div>

                                                <div className="bid-share-box">
                                                    <ul className="bid-share-list">
                                                        <li>
                                                            <span className="first_para fz-20 fw-700">
                                                                Share :
                                                            </span>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >

                                                                <FaFacebookF />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >

                                                                <FaLinkedinIn />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >

                                                                <FaWhatsapp />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >

                                                                <BsTelegram />
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div
                                                className="tab-pane fade"
                                                id="profile"
                                                role="tabpanel"
                                            >
                                                <div className="col-lg-12">
                                                    <div className="accordion custom-accordion" id="customAccordion">
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

                                                                        </span>
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
                                                                        {/* <FaFileAlt className="file-icon" /> */}
                                                                        <span>
                                                                            <b>3. Chapter 3 -</b> How to Download VS Code
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
                                                                        {/* <FaFileAlt className="file-icon" /> */}
                                                                        <span>
                                                                            <b>4. Chapter 4 -</b> How to Download VS Code
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
                                                                        {/* <FaFileAlt className="file-icon" /> */}
                                                                        <span>
                                                                            <b>5. Chapter 5 -</b> How to Download VS Code
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className="accordion-actions">
                                                                        <a href="#" className="course-download-btn">
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

                                            <div
                                                className="tab-pane fade"
                                                id="review"
                                                role="tabpanel"
                                            >
                                                <div className="col-lg-12">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div>
                                                            <h3 className="first_para mb-0">Review</h3>
                                                        </div>
                                                        <div className="">
                                                            <div className="dropdown">
                                                                <a
                                                                    href="#"
                                                                    className="sort-btn"
                                                                    id="acticonMenu2"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    Sort By <MdSort />

                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby="acticonMenu2"
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" data-bs-toggle="modal" data-bs-target="#edit-Announcement">
                                                                            Most Relevant
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" data-bs-toggle="modal" data-bs-target="#edit-Announcement">
                                                                            Newest
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" >
                                                                            Oldest
                                                                        </a>
                                                                    </li>



                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="payment-tp-border">
                                                        <div className="udemy-review-box">
                                                            <div className="udemy-review-picture">
                                                                <img src="/review_01.jpg" alt="" />
                                                            </div>

                                                            <div className="udemy-review-content">
                                                                <h5>Kapil Sharma</h5>
                                                                <h6>India </h6>
                                                                <div className=" cart-details-bx mb-2">
                                                                    <ul className="rating-list">
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStar />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /> </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>

                                                                    </ul>
                                                                </div>

                                                                <p>I’m a professional Video Editor with experience in creating engaging short-form and long-form videos for brands and digital platforms. I specialize in clean cuts, smooth transitions, subtitles, sound design, and platform-optimized edits</p>

                                                            </div>
                                                        </div>
                                                        <div className="udemy-review-box">
                                                            <div className="udemy-review-picture">
                                                                <img src="/review_01.jpg" alt="" />
                                                            </div>

                                                            <div className="udemy-review-content">
                                                                <h5>Kapil Sharma</h5>
                                                                <h6>India </h6>
                                                                <div className=" cart-details-bx mb-2">
                                                                    <ul className="rating-list">
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStar />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /> </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>

                                                                    </ul>
                                                                </div>

                                                                <p>I’m a professional Video Editor with experience in creating engaging short-form and long-form videos for brands and digital platforms. I specialize in clean cuts, smooth transitions, subtitles, sound design, and platform-optimized edits</p>

                                                            </div>
                                                        </div>
                                                        <div className="udemy-review-box">
                                                            <div className="udemy-review-picture">
                                                                <img src="/review_01.jpg" alt="" />
                                                            </div>

                                                            <div className="udemy-review-content">
                                                                <h5>Kapil Sharma</h5>
                                                                <h6>India </h6>
                                                                <div className=" cart-details-bx mb-2">
                                                                    <ul className="rating-list">
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStar />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline />
                                                                        </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /> </a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>
                                                                        <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>

                                                                    </ul>
                                                                </div>

                                                                <p>I’m a professional Video Editor with experience in creating engaging short-form and long-form videos for brands and digital platforms. I specialize in clean cuts, smooth transitions, subtitles, sound design, and platform-optimized edits</p>

                                                            </div>
                                                        </div>

                                                        <div className="text-center mt-2">
                                                            <button className="thm-btn outline">View More</button>

                                                        </div>

                                                    </div>

                                                </div>



                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="course-card mb-3">
                                <div className="udemy-price-box">
                                    <h5>$24.92 <del className="udemy-course-offer">$32.90</del></h5>
                                    <span className="udemy-course-off">20% OFF</span>
                                </div>
                                <div className="mt-3">
                                    <NavLink to="/buy-course" className="thm-btn w-100">Buy Now</NavLink>
                                </div>
                                <div className="d-flex align-items gap-3 mt-3">
                                    <NavLink to="/add-cart" className="thm-btn w-100 outline">Add to Cart</NavLink>
                                    <NavLink to="/my-wishlist" className="thm-btn w-100 outline">Add to Wishlist</NavLink>
                                </div>

                                <div className="udemy-all-box">
                                    <ul className="udemy-all-list">
                                        <li className="udemy-course-item"> <span><PiCardsThreeFill className="udemy-list-icon" />

                                        </span> 22 Section </li>
                                        <li className="udemy-course-item"> <span><MdDesktopWindows className="udemy-list-icon" />
                                        </span> 152 Lecture </li>
                                        <li className="udemy-course-item"> <span><IoMdVideocam className="udemy-list-icon" />

                                        </span> 21h Video length </li>
                                        <li className="udemy-course-item"> <span>   <IoLanguage className="udemy-list-icon" />

                                        </span> English </li>
                                    </ul>

                                </div>

                            </div>

                            <div className="course-master-card">
                                <div className="webinar-content">
                                    <span className="webinar-title">WEBINAR</span>

                                    <h6>Ana Kursova</h6>
                                    <h3>Masterclass in Design Thinking, Innovation & Creativity</h3>

                                    <div>
                                        <a href="javacript:void(0)" className="course-more-btn">Learn More</a>
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

export default CourseDetailsView;
