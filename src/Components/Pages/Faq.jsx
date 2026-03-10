import { NavLink } from "react-router-dom"

function Faq() {
  return (
    <>
    <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">FAQ</h3>
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
                                                    FAQ
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

    <section className='faq-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-learn-content'>
                                <h5> Frequently <span className='top-learn-title'> Ask Question </span> </h5>
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <div className='faq-cards'>
                                <div className="accordion zx-faq-accordion " id="zxFaq">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button className="accordion-button  zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseOne"
                                                aria-expanded="true">
                                                Who is this course designed for?
                                            </button>
                                        </h2>
                                        <div id="collapseOne"
                                            className="accordion-collapse collapse show"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingTwo">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseTwo">
                                                What makes this course easy to understand for students?
                                            </button>
                                        </h2>
                                        <div id="collapseTwo"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingThree">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseThree">
                                                What type of knowledge or skills does this course help students develop?
                                            </button>
                                        </h2>
                                        <div id="collapseThree"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingFour">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseFour">
                                                Why is this course useful for students at a school level?
                                            </button>
                                        </h2>
                                        <div id="collapseFour"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingFive">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseFive">
                                                What learning materials are included in this course?
                                            </button>
                                        </h2>
                                        <div id="collapseFive"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
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
  )
}

export default Faq