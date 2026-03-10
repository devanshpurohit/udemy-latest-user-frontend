import { FaInfoCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config/config";




function Quiz() {

    const navigate = useNavigate()
    const { courseId, lessonId, quizId } = useParams();
    const [quizData, setQuizData] = useState(null);

    const [courseTitle, setCourseTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [nextLesson, setNextLesson] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!courseId || !lessonId || !quizId) return;

            try {
                setLoading(true);
                const res = await fetch(`${config.API_BASE_URL}/public/courses/${courseId}`);
                const data = await res.json();

                if (!data?.success) {
                    setQuizData(null);
                    return;
                }

                const course = data.data;
                setCourseTitle(course?.title || "");

                const lessonsFromSections = Array.isArray(course?.sections)
                    ? course.sections.flatMap((section) => section?.lessons || [])
                    : [];
                const lessons = lessonsFromSections.length > 0 ? lessonsFromSections : (course?.lessons || []);
                  // current lesson index
const currentIndex = lessons.findIndex(
    (l) => String(l?._id || l?.id) === String(lessonId)
);

// next lesson
const nextLesson = lessons[currentIndex + 1];

// store next lesson
setNextLesson(nextLesson || null);
                const lesson = lessons.find(
                    (l) => String(l?._id || l?.id) === String(lessonId)
                );

                const quiz = lesson?.quizzes?.find(
                    (q) => String(q?._id || q?.id) === String(quizId)
                );

                setQuizData(quiz || null);
            } catch (e) {
                console.error("❌ Error fetching quiz:", e);
                setQuizData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [courseId, lessonId, quizId]);

    const normalizedOptions = useMemo(() => {
        const raw = quizData?.options;
        if (!Array.isArray(raw)) return [];
        return raw
            .map((opt) => {
                if (typeof opt === "string") return opt;
                if (opt && typeof opt === "object") return opt.text ?? opt.label ?? opt.value ?? "";
                return String(opt ?? "");
            })
            .filter(Boolean);
    }, [quizData]);


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
                                            Quiz
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
                                        <h4>{courseTitle || "Front-end Development course"}</h4>
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
                                                <h5>{quizData?.question || "What is Frontend Development?"}</h5>
                                            </div>

                                            <div className="booklet-btm-bx">
                                                <ul className="anwser-booklet-bx">
                                                    {normalizedOptions.length > 0 ? (
                                                        normalizedOptions.map((option, index) => (
                                                            <li className="booklet-anwser-item" key={index}>
                                                                <label className="booklet-label">
                                                                   <input
  type="radio"
  name="answer"
  className="booklet-radio"
  value={option}
  onChange={() => setSelectedAnswer(option)}
/>
                                                                    <span className="booklet-option-bx">
                                                                        {String.fromCharCode(97 + index)}.
                                                                    </span>{" "}
                                                                    {option}
                                                                </label>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <li className="booklet-anwser-item">
                                                                <label className="booklet-label">
                                                                    <input type="radio" name="answer" className="booklet-radio" />
                                                                    <span className="booklet-option-bx">a.</span> Development of server-side logic and databases
                                                                </label>
                                                            </li>
                                                            <li className="booklet-anwser-item">
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
                                                        </>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="udemy-sumbit-box">
                                                <div className="udemy-back-btn-box">
                                                    <button className="udemy-thm-btn">Previous Question</button>
                                                    <button className="udemy-thm-btn outline">Next Question</button>
                                                </div>

                                                <div className="udemy-back-btn-box">
                                                    <button type="button" className="udemy-thm-btn outline" data-bs-toggle="modal" data-bs-target="#Not-Quiz">Clear Response</button>
                                                  <button
  type="button"
  className="udemy-success-btn"
  onClick={() => {

    if (!selectedAnswer) {

      const modal = new window.bootstrap.Modal(
        document.getElementById("Not-Quiz")
      );
      modal.show();

    } else {

      const modal = new window.bootstrap.Modal(
        document.getElementById("submit-Quiz")
      );
      modal.show();

    }

  }}
>
Submit Quiz
</button>
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
                                            <button className="thm-btn px-5" data-bs-dismiss="modal" aria-label="Close">Confirm</button>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Logout Popup End */}

            {/*Submit Quiz Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#submit-Quiz" */}
            <div className="modal step-modal fade" id="submit-Quiz" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-submit-box">

                        <div className="text-end p-3">
                            <button type="button" className="modal-close-btn text-black fz-16" data-bs-dismiss="modal" aria-label="Close">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>

                        <div className="modal-body pt-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="successful-modal-box">
                                        <div class="uq-success-box uq-success-scale" id="uq-success">
                                            <svg class="uq-success-svg" viewBox="0 0 100 100">
                                                <circle class="uq-success-circle" cx="50" cy="50" r="45" />
                                                <polyline class="uq-success-check" points="30,52 45,65 70,38" />
                                            </svg>
                                        </div>

                                        <div className="udemy-chapter-box ">
                                            <h5>Congratulation Next Chapter Unlock.</h5>
                                            <p className="pt-2 mb-0">You Score <span className="umdey-score-title">7/10</span></p>
                                        </div>

                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3 preview-modal-box">
                                            <button type="button"  className="thm-btn px-5 outline"onClick={() => navigate('/quiz-preview')} >Preview Quiz</button>
                     <button
  className="thm-btn px-5"
  onClick={() => {

    const modalElement = document.getElementById("submit-Quiz");
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);

    if (modalInstance) {
      modalInstance.hide();
    }

    // remove leftover backdrop
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    document.body.classList.remove("modal-open");

    if (nextLesson) {
      navigate(`/course/${courseId}/learn`, {
        state: { lessonId: nextLesson._id }
      });
    } else {
      navigate(`/course/${courseId}/learn`);
    }

  }}
>
Next Chapter
</button>

                                        </div>


                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Submit Quiz Popup End */}


            {/*Submit Quiz Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#Not-Quiz" */}
            <div className="modal step-modal fade" id="Not-Quiz" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-submit-box">

                        <div className="text-end p-3">
                            <button type="button" className="modal-close-btn text-black fz-16" data-bs-dismiss="modal" aria-label="Close">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>

                        <div className="modal-body pt-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="successful-modal-box">
                                        <div class="uq-close-box uq-close-scale" id="uq-close">
                                            <svg class="uq-close-svg" viewBox="0 0 100 100">
                                                <circle class="uq-close-circle" cx="50" cy="50" r="45" />
                                                <line class="uq-close-line1" x1="35" y1="35" x2="65" y2="65" />
                                                <line class="uq-close-line2" x1="65" y1="35" x2="35" y2="65" />
                                            </svg>
                                        </div>


                                        <div className="udemy-chapter-box">
                                            <h5>Oops! Next chapter is locked, <span className="d-lg-block d-sm-inline">retake the quiz to unlock it.</span> </h5>
                                            <p className="pt-2 mb-0">You Score <span className="umdey-score-not-title">7/10</span></p>
                                        </div>

                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3 preview-modal-box">
                                            <button className="thm-btn px-5 outline" >Preview Quiz</button>
                                            <button className="thm-btn px-5" data-bs-dismiss="modal" aria-label="Close">Retake Quiz</button>

                                        </div>


                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Submit Quiz Popup End */}



        </>
    )
}

export default Quiz