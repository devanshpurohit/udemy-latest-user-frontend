import { FaInfoCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { NavLink } from "react-router-dom";

function QuizPreview() {
    return (
        <>
            <section className="quiz-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="admin-breadcrumb mb-3">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb custom-breadcrumb justify-content-start quiz-breadcrumb">
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
                                            Quiz Preview
                                        </li>
                                    </ol>
                                </nav>
                            </div>

                            <h3 className="nw-lg-title">Quiz</h3>
                        </div>
                    </div>
                </div>

            </section>



            <section className="course-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="udemy-quiz-card">
                                <div className="quiz-header">
                                    <div className="quiz-title">
                                        <h4>Front-end Development course</h4>
                                    </div>
                                    <div className="quiz-info">
                                        <a href="#" className="quiz-info-btn"> <FaInfoCircle />  </a>
                                    </div>
                                </div>

                                <div className="udemy-question-card">
                                    <div>
                                        <ul className="udemy-quiz-list">
                                            <li className="udemy-quiz-item">Questions</li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn udemy-quiz-active">1</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">2</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">3</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">4</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">5</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">6</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">7</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">8</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">9</a></li>
                                            <li className="udemy-quiz-item"><a href="#" className="udemy-qz-btn">10</a></li>

                                        </ul>
                                    </div>


                                    <div className="udemy-quiz-change">
                                        <h6 className="mb-0 fw-700 fz-16">View in</h6>
                                        <select name="" id="">
                                            <option value="">English</option>
                                        </select>

                                        <div>
                                            <button type="button" className="quiz-exit-btn" data-bs-toggle="modal" data-bs-target="#quiz-Exit">Exit <MdLogout /> </button>
                                        </div>

                                    </div>

                                </div>

                                <div className="udemy-quiz-section">
                                    <div className="udemy-question-tp-box">
                                        <div className="udmey-quiz-question-title">
                                            <h5>Questions</h5>
                                        </div>

                                        <div className="udemy-question-course">
                                            <div className="umdey-title">
                                                <h6>1.</h6>
                                                <h5>What is Frontend Development?</h5>
                                            </div>

                                            <div className="booklet-btm-bx">
                                                <ul className="anwser-booklet-bx">
                                                    <li className="booklet-anwser-item correct-booklet-anwser">
                                                        <label className="booklet-label">
                                                            <input type="radio" name="answer" className="booklet-radio" />
                                                            <span className="booklet-option-bx">a.</span> Development of server-side logic and databases
                                                        </label>
                                                    </li>
                                                    <li className="booklet-anwser-item incorrect-booklet-anwser">
                                                        <label className="booklet-label">
                                                            <input type="radio" name="answer" className="booklet-radio" />
                                                            <span className="booklet-option-bx">b.</span>  Designing and building the user-facing part of a website or application
                                                        </label>
                                                    </li>
                                                    <li className="booklet-anwser-item">
                                                        <label className="booklet-label">
                                                            <input type="radio" name="answer" className="booklet-radio" />
                                                            <span className="booklet-option-bx">c.</span> Managing network security and data storage
                                                        </label>
                                                    </li>
                                                    <li className="booklet-anwser-item">
                                                        <label className="booklet-label">
                                                            <input type="radio" name="answer" className="booklet-radio" />
                                                            <span className="booklet-option-bx">d.</span> Writing operating system–level programs
                                                        </label>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="udemy-sumbit-box">
                                                <div className="udemy-back-btn-box">
                                                    <button className="udemy-thm-btn">Previous Question</button>
                                                    <button className="udemy-thm-btn outline">Next Question</button>
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


            {/*Logout Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#quiz-Exit" */}
            <div className="modal step-modal fade" id="quiz-Exit" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content custom-logout-box">
                        <div className="modal-body pt-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="quiz-logout-box text-center" >
                                        <span className="logout-icon"><IoLogOut />
                                        </span>
                                        <p className="py-3">Are You Sure You Want To Exit</p>

                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                                            <NavLink to="/course-details-content" className="thm-btn px-5" >Confirm</NavLink>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Logout Popup End */}



        </>
    )
}

export default QuizPreview