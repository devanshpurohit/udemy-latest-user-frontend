import { FaInfoCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config/config";
import { submitQuizScore } from "../../services/apiService";


function Quiz() {

    const navigate = useNavigate();
    const { courseId, lessonId, quizId } = useParams();

    const [quizzes, setQuizzes] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);

    const [courseTitle, setCourseTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [nextLesson, setNextLesson] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!courseId || !lessonId) return;

            try {
                setLoading(true);
                const res = await fetch(`${config.API_BASE_URL}/public/courses/${courseId}`);
                const data = await res.json();

                if (!data?.success) {
                    setQuizzes([]);
                    return;
                }

                const course = data.data;
                setCourseTitle(course?.title || "");

                const lessonsFromSections = Array.isArray(course?.sections)
                    ? course.sections.flatMap((section) => section?.lessons || [])
                    : [];
                const lessons = lessonsFromSections.length > 0 ? lessonsFromSections : (course?.lessons || []);

                const currentIndex = lessons.findIndex(
                    (l) => String(l?._id || l?.id) === String(lessonId)
                );

                const nextLessonObj = lessons[currentIndex + 1];
                setNextLesson(nextLessonObj || null);

                const lesson = lessons[currentIndex];
                const allQuizzes = lesson?.quizzes || [];
                setQuizzes(allQuizzes);

                // If a specific quiz id was provided, jump to that question
                if (quizId && allQuizzes.length > 0) {
                    const idx = allQuizzes.findIndex(
                        (q) => String(q?._id || q?.id) === String(quizId)
                    );
                    if (idx !== -1) setCurrentQuestionIndex(idx);
                }

            } catch (e) {
                console.error("Error fetching quiz:", e);
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [courseId, lessonId, quizId]);

    const currentQuiz = quizzes[currentQuestionIndex];

    const normalizedOptions = useMemo(() => {
        const raw = currentQuiz?.options;
        if (!Array.isArray(raw)) return [];
        return raw
            .map((opt) => {
                if (typeof opt === "string") return opt;
                if (opt && typeof opt === "object") return opt.text ?? opt.label ?? opt.value ?? "";
                return String(opt ?? "");
            })
            .filter(Boolean);
    }, [currentQuiz]);

    const handleSelectAnswer = (option) => {
        if (currentQuiz) {
            setUserAnswers((prev) => ({
                ...prev,
                [currentQuiz._id || currentQuestionIndex]: option,
            }));
        }
    };

    const selectedAnswer = currentQuiz
        ? userAnswers[currentQuiz._id || currentQuestionIndex]
        : null;

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizzes.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        // Check if the selected answer is correct for the current question
        const correctOptionIndex = currentQuiz.correctAnswer;
        const correctOptionText = normalizedOptions[correctOptionIndex];

        if (selectedAnswer === correctOptionText) {
            // Correct - Show Success Modal
            setScore(1); 
            
            // 🔥 Submit score to backend
            submitQuizScore(courseId, lessonId, 100).then(res => {
                if (res.success) {
                    console.log("✅ Quiz score saved successfully");
                }
            });

            const modal = new window.bootstrap.Modal(document.getElementById("submit-Quiz"));
            modal.show();
        } else {
            // Incorrect - Show Oops Modal
            const modal = new window.bootstrap.Modal(document.getElementById("Not-Quiz"));
            modal.show();
        }
    };

    if (loading) {
        return (
            <section className="quiz-section">
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </section>
        );
    }

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
                                            <a href="/" className="breadcrumb-link">Home</a>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <a href="/my-course" className="breadcrumb-link">Course</a>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
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
                                        <h4>{courseTitle || "Course Quiz"}</h4>
                                    </div>
                                    <div className="quiz-info">
                                        <a href="#" className="quiz-info-btn"><FaInfoCircle /></a>
                                    </div>
                                </div>

                                <div className="udemy-question-card">
                                    <div>
                                        <ul className="udemy-quiz-list">
                                            <li className="udemy-quiz-item">Questions</li>
                                            {quizzes.length > 0 ? (
                                                quizzes.map((_, idx) => (
                                                    <li className="udemy-quiz-item" key={idx}>
                                                        <a
                                                            href="#"
                                                            className={`udemy-qz-btn ${idx === currentQuestionIndex ? "udemy-quiz-active" : ""}`}
                                                            onClick={(e) => { e.preventDefault(); setCurrentQuestionIndex(idx); }}
                                                        >
                                                            {idx + 1}
                                                        </a>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="udemy-quiz-item text-muted">No questions</li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="udemy-quiz-change">
                                        <h6 className="mb-0 fw-700 fz-16">View in</h6>
                                        <select name="" id="">
                                            <option value="">English</option>
                                        </select>
                                        <div>
                                            <button type="button" className="quiz-exit-btn" data-bs-toggle="modal" data-bs-target="#quiz-Exit">
                                                Exit <MdLogout />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="udemy-quiz-section">
                                    <div className="udemy-question-tp-box">
                                        <div className="udmey-quiz-question-title">
                                            <h5>Questions</h5>
                                        </div>

                                        <div className="udemy-question-course">
                                            {quizzes.length === 0 ? (
                                                <div className="text-muted py-4 text-center">No quiz questions available for this lesson.</div>
                                            ) : (
                                                <>
                                                    <div className="umdey-title">
                                                        <h6>{currentQuestionIndex + 1}.</h6>
                                                        <h5>{currentQuiz?.question || "Loading question..."}</h5>
                                                    </div>

                                                    <div className="booklet-btm-bx">
                                                        <ul className="anwser-booklet-bx">
                                                            {normalizedOptions.map((option, index) => (
                                                                <li className="booklet-anwser-item" key={index}>
                                                                    <label className="booklet-label" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`answer-q${currentQuestionIndex}`}
                                                                            className="booklet-radio"
                                                                            value={option}
                                                                            checked={selectedAnswer === option}
                                                                            onChange={() => handleSelectAnswer(option)}
                                                                            style={{ cursor: 'pointer' }}
                                                                        />
                                                                        <span className="booklet-option-bx">
                                                                            {String.fromCharCode(97 + index)}.
                                                                        </span>{" "}
                                                                        {option}
                                                                    </label>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}

                                            <div className="udemy-sumbit-box">
                                                <div className="udemy-back-btn-box">
                                                    <button
                                                        className="udemy-thm-btn"
                                                        disabled={currentQuestionIndex === 0}
                                                        onClick={handlePrevious}
                                                    >
                                                        Previous Question
                                                    </button>
                                                    <button
                                                        className="udemy-thm-btn outline"
                                                        disabled={currentQuestionIndex === quizzes.length - 1}
                                                        onClick={handleNext}
                                                    >
                                                        Next Question
                                                    </button>
                                                </div>

                                                <div className="udemy-back-btn-box">
                                                    <button
                                                        type="button"
                                                        className="udemy-thm-btn outline"
                                                        onClick={() => {
                                                            if (currentQuiz) {
                                                                setUserAnswers((prev) => {
                                                                    const updated = { ...prev };
                                                                    delete updated[currentQuiz._id || currentQuestionIndex];
                                                                    return updated;
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Clear Response
                                                    </button>
                                                    {selectedAnswer && (
                                                        <button
                                                            type="button"
                                                            className="udemy-success-btn"
                                                            onClick={handleSubmit}
                                                        >
                                                            Submit Quiz
                                                        </button>
                                                    )}
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

            {/* Exit Popup */}
            <div className="modal step-modal fade" id="quiz-Exit" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content custom-logout-box">
                        <div className="modal-body pt-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="quiz-logout-box text-center">
                                        <span className="logout-icon"><IoLogOut /></span>
                                        <p className="py-3">Are You Sure You Want To Exit</p>
                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                                            <button 
                                                className="thm-btn px-5" 
                                                onClick={() => {
                                                    const modalElement = document.getElementById("quiz-Exit");
                                                    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                                                    if (modalInstance) modalInstance.hide();
                                                    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
                                                    document.body.classList.remove("modal-open");
                                                    document.body.style.removeProperty("overflow");
                                                    document.body.style.removeProperty("padding-right");
                                                    navigate(`/course/${courseId}/learn`);
                                                }}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Quiz Success Popup */}
            <div className="modal step-modal fade" id="submit-Quiz" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                        <div className="uq-success-box uq-success-scale" id="uq-success">
                                            <svg className="uq-success-svg" viewBox="0 0 100 100">
                                                <circle className="uq-success-circle" cx="50" cy="50" r="45" />
                                                <polyline className="uq-success-check" points="30,52 45,65 70,38" />
                                            </svg>
                                        </div>
                                        <div className="udemy-chapter-box">
                                            <h5>Congratulation! Next Chapter Unlocked.</h5>
                                            <p className="pt-2 mb-0">
                                                You Scored{" "}
                                                <span className="umdey-score-title">
                                                    {score !== null ? `${score}/${quizzes.length}` : ""}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3 preview-modal-box">
                                            <button
                                                type="button"
                                                className="thm-btn px-5 outline"
                                                onClick={() => {
                                                    const modalElement = document.getElementById("submit-Quiz");
                                                    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                                                    if (modalInstance) {
                                                        // Listen for the modal to fully close, then navigate
                                                        modalElement.addEventListener("hidden.bs.modal", () => {
                                                            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
                                                            document.body.classList.remove("modal-open");
                                                            document.body.style.removeProperty("overflow");
                                                            document.body.style.removeProperty("padding-right");
                                                            navigate(`/quiz-preview/${courseId}/${lessonId}`);
                                                        }, { once: true });
                                                        modalInstance.hide();
                                                    } else {
                                                        navigate(`/quiz-preview/${courseId}/${lessonId}`);
                                                    }
                                                }}
                                            >
                                                Preview Quiz
                                            </button>
                                            <button
                                                className="thm-btn px-5"
                                                onClick={() => {
                                                    const modalElement = document.getElementById("submit-Quiz");
                                                    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                                                    if (modalInstance) modalInstance.hide();
                                                    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
                                                    document.body.classList.remove("modal-open");
                                                    if (nextLesson) {
                                                        navigate(`/course/${courseId}/learn`, { state: { lessonId: nextLesson._id } });
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

            {/* Submit Quiz No Answer Popup */}
            <div className="modal step-modal fade" id="Not-Quiz" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                        <div className="uq-close-box uq-close-scale" id="uq-close">
                                            <svg className="uq-close-svg" viewBox="0 0 100 100">
                                                <circle className="uq-close-circle" cx="50" cy="50" r="45" />
                                                <line className="uq-close-line1" x1="35" y1="35" x2="65" y2="65" />
                                                <line className="uq-close-line2" x1="65" y1="35" x2="35" y2="65" />
                                            </svg>
                                        </div>
                                        <div className="udemy-chapter-box">
                                            <h5>Oops! Your answer is incorrect. Please try again.</h5>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3 preview-modal-box">
                                            <button className="thm-btn px-5" data-bs-dismiss="modal" aria-label="Close">Continue Quiz</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Quiz;