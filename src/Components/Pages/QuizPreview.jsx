import { FaInfoCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import config from "../../config/config";

function QuizPreview() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!courseId || !lessonId) return;
            try {
                setLoading(true);
                const res = await fetch(`${config.API_BASE_URL}/public/courses/${courseId}`);
                const data = await res.json();
                if (!data?.success) { setQuizzes([]); return; }

                const course = data.data;
                setCourseTitle(course?.title || "");

                const lessonsFromSections = Array.isArray(course?.sections)
                    ? course.sections.flatMap((s) => s?.lessons || [])
                    : [];
                const lessons = lessonsFromSections.length > 0 ? lessonsFromSections : (course?.lessons || []);
                const lesson = lessons.find((l) => String(l?._id || l?.id) === String(lessonId));
                setQuizzes(lesson?.quizzes || []);
            } catch (e) {
                console.error("Error fetching quiz preview:", e);
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [courseId, lessonId]);

    const currentQuiz = quizzes[currentQuestionIndex];

    const normalizedOptions = useMemo(() => {
        const raw = currentQuiz?.options;
        if (!Array.isArray(raw)) return [];
        return raw.map((opt) => {
            if (typeof opt === "string") return opt;
            if (opt && typeof opt === "object") return opt.text ?? opt.label ?? opt.value ?? "";
            return String(opt ?? "");
        }).filter(Boolean);
    }, [currentQuiz]);

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
                                            <a href="/available-courses" className="breadcrumb-link">Courses</a>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Quiz Preview
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                            <h3 className="nw-lg-title">Quiz Preview</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="course-section pt-0">
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
                                                        <h5>{currentQuiz?.question || ""}</h5>
                                                    </div>

                                                    <div className="booklet-btm-bx">
                                                        <ul className="anwser-booklet-bx">
                                                            {normalizedOptions.map((option, index) => {
                                                                const isCorrect = index === currentQuiz?.correctAnswer;
                                                                return (
                                                                    <li
                                                                        className={`booklet-anwser-item ${isCorrect ? "correct-booklet-anwser" : ""}`}
                                                                        key={index}
                                                                    >
                                                                        <label className="booklet-label" style={{ pointerEvents: 'none', cursor: 'default' }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`preview-answer-q${currentQuestionIndex}`}
                                                                                className="booklet-radio"
                                                                                defaultChecked={isCorrect}
                                                                                disabled
                                                                            />
                                                                            <span className="booklet-option-bx">
                                                                                {String.fromCharCode(97 + index)}.
                                                                            </span>{" "}
                                                                            {option}
                                                                        </label>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}

                                            <div className="udemy-sumbit-box">
                                                <div className="udemy-back-btn-box">
                                                    <button
                                                        className="udemy-thm-btn"
                                                        disabled={currentQuestionIndex === 0}
                                                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                                    >
                                                        Previous Question
                                                    </button>
                                                    <button
                                                        className="udemy-thm-btn outline"
                                                        disabled={currentQuestionIndex === quizzes.length - 1}
                                                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                                    >
                                                        Next Question
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
                                                    navigate(courseId ? `/course/${courseId}/learn` : "/");
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
        </>
    );
}

export default QuizPreview;