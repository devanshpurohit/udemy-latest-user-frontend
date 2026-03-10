
function ContactUs() {
  return (
    <>
   <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Contact Us</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>



                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Contact Us
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


   <section className='contact-section'>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className='contact-card'>
                        <form action="">
                            <h4 className='contact-title'>Contact Us</h4>
                            <p className='contact-para'>Reach out to us or rise a complain</p>
                            
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="">First Name</label>
                                        <input type="text" name="" id="" className='form-control' placeholder='Enter First Name' />
                                    </div>

                                </div>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="">Last Name</label>
                                        <input type="text" name="" id="" className='form-control' placeholder='Enter Last Name' />
                                    </div>

                                </div>

                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="">Email Address</label>
                                        <input type="email" name="" id="" className='form-control' placeholder='Enter Email Address' />
                                    </div>

                                </div>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="">Contact Name</label>
                                        <input type="number" name="" id="" className='form-control' placeholder='+91 | 000 000 0000' />
                                    </div>

                                </div>
                                <div className='col-lg-12'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="">Message for us?</label>
                                       <textarea name="" id="" className='form-control' placeholder='Write Message'></textarea>
                                    </div>

                                </div>

                                <div className='col-lg-12 mt-3'>
                                    <button className='thm-btn w-100'>Submit</button>

                                </div>

                            </div>

                        </form>

                    </div>

                </div>
            </div>
        </div>

      </section>
   </>
  )
}

export default ContactUs