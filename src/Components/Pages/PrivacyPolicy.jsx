import { NavLink } from "react-router-dom"

function PrivacyPolicy() {
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
                    <h6>Term & Condition</h6>
                        <p className="pb-2">These Terms and Conditions govern your access to and use of the [Your App Name] mobile application and website (the “Platform”), operated by [Company Name]. By registering, accessing, or using the Platform, you agree to comply with and be legally bound by these Terms. If you do not agree, you must not use the Platform.
                        The Platform provides an online marketplace that connects clients seeking professional services with freelancers offering services such as graphic design, web development, digital marketing, content writing, consulting, and other skilled services. The Platform acts only as an intermediary and does not directly provide freelance services. We do not guarantee the quality, accuracy, legality, or completion of any services provided by freelancers, nor do we guarantee job availability for freelancers.
                        To use the Platform, you must be at least 18 years old and provide accurate, complete, and updated registration information. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. The Platform reserves the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in suspicious or fraudulent activities.</p>
                        <p className="pb-2">
                        Clients are responsible for clearly outlining project requirements, timelines, and payment terms before hiring a freelancer. Freelancers agree to deliver services professionally, meet agreed deadlines, and provide original and lawful work. Both parties agree to communicate respectfully and professionally at all times while using the Platform.
                        Payments for services must be made through the Platform using approved payment methods. The Platform may charge a service fee or commission, which will be disclosed before payment confirmation. In cases where an escrow system is used, funds may be held securely until the client approves the completed work. The release of funds may be delayed if a dispute is raised. The Platform is not responsible for delays, failures, or errors caused by third-party payment gateways.</p>

                </div>

                <div className="post-divider-line"> </div>
                 <div className="policy-content">
                    <h6>Privacy Policies</h6>
                        <p className="pb-2">This Privacy Policy explains how [Your App Name] (“Platform”), operated by [Company Name], collects, uses, stores, and protects your personal information when you access or use our mobile application and website. By using the Platform, you agree to the collection and use of information in accordance with this Privacy Policy</p>
                        <p className="pb-2">
                        We collect personal information that you provide directly to us during registration or while using the Platform. This may include your name, email address, phone number, profile details, payment information, professional qualifications, uploaded documents, and communication between clients and freelancers. We may also collect technical information such as device type, IP address, browser type, operating system, usage data, and cookies to improve performance and user experience.</p>
                        <p className="pb-2">
                        The information collected is used to create and manage user accounts, facilitate communication between clients and freelancers, process payments, provide customer support, improve platform functionality, ensure security, prevent fraud, and comply with legal obligations. We may use your email or phone number to send service-related notifications, updates, promotional offers, or important account information. You may opt out of marketing communications at any time.</p>

                </div>

                 <div className="post-divider-line"> </div>

                   <div className="policy-content">
                    <h6>Cookies Policies</h6>
                        <p className="pb-2">This Cookies Policy explains how [Your App Name] (“Platform”), operated by [Company Name], uses cookies and similar tracking technologies when you access or use our mobile application and website. By continuing to use the Platform, you consent to our use of cookies in accordance with this policy</p>
                        <p className="pb-2">
                        Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you visit a website or use an application. These cookies help us recognize your device, remember your preferences, improve functionality, enhance user experience, and analyze platform performance. Cookies do not typically contain personally identifiable information, but they may be linked to personal data you have provided to us.</p>
                      

                </div>

                 <div className="post-divider-line"> </div>

                     <div className="policy-content">
                    <h6>License Agreement</h6>
                        <p className="pb-2">This License Agreement governs your use of the [Your App Name] mobile application, website, and related services (the “Platform”), operated by [Company Name]. By downloading, installing, accessing, or using the Platform, you agree to be bound by the terms of this License Agreement. If you do not agree to these terms, you must not use the Platform.</p>

                        <p className="pb-2">
                        Subject to your compliance with this Agreement and the applicable Terms & Conditions, [Company Name] grants you a limited, non-exclusive, non-transferable, non-sublicensable, and revocable license to download, install, and use the Platform solely for your personal or business use in connection with freelance marketplace activities. This license does not grant you ownership of the Platform or any intellectual property rights associated with it.</p>
                      

                </div>


                </div>

            </div>

        </div>

      </section>
    
    </>
  )
}

export default PrivacyPolicy