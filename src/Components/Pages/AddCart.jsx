import { faStar, faStarHalf, faTrash, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { syncCartWithPurchases } from "../../services/apiService";
import { useAuth } from "../../contexts/AuthContext";
import { getLangText } from "../../utils/languageUtils";

function AddCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const navigate = useNavigate();

    // Load cart items from localStorage
    useEffect(() => {
        const loadCartItems = () => {
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                console.log('🛒 Cart items loaded:', cart);
                console.log('🛒 Cart item types:', cart.map(item => ({
                    _id: typeof item._id,
                    title: typeof item.title,
                    instructor: typeof item.instructor,
                    price: typeof item.price,
                    thumbnail: typeof item.thumbnail
                })));
                setCartItems(cart);
                setLoading(false);
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartItems([]);
                setLoading(false);
            }
        };

        loadCartItems();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadCartItems();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        syncCartWithPurchases(); // Clean cart from purchased items on mount
    }, []);
    useEffect(() => {

    const loadCartItems = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        setLoading(false);
    };

    loadCartItems();

    const handleCartUpdate = () => {
        loadCartItems();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
        window.removeEventListener("cartUpdated", handleCartUpdate);
    };

}, []);
    const handleCheckout = () => {
    const courseIds = cartItems.map(item => item._id);

    navigate("/buy-course", {
        state: { courseIds }
    });
};

    // Remove item from cart
   const removeFromCart = (courseId) => {
    const updatedCart = cartItems.filter(item => item._id !== courseId);
    setCartItems(updatedCart);

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated")); // ⭐ add this
};

    // Calculate total price
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
    };

    // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));

    window.dispatchEvent(new Event("cartUpdated"));
};

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h3>Loading Cart...</h3>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Shopping Cart</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <Link to="/" className="breadcrumb-link">
                                                        Home
                                                    </Link>
                                                </li>
                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Shopping Cart
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
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            {cartItems.length === 0 ? (
                                <div className="course-card mb-3">
                                    <div className="text-center py-5">
                                        <h4>Your cart is empty</h4>
                                        <p className="text-muted mb-4">Add some courses to get started!</p>
                                        <Link to="/available-courses" className="thm-btn">
                                            Browse Courses
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="course-card mb-3">
                                        {cartItems.map((item, index) => (
                                            <div key={item._id || index} className="cart-content-card summary-header pb-3">
                                                <div className="main-cart-box">
                                                    <div className="cart-banner-box">
                                                        <img 
                                                            src={item.thumbnail || "/thumb-banner.png"} 
                                                            alt={getLangText(item.title, userLanguage)} 
                                                         
                                                        />
                                                    </div>

                                                    <div className="cart-details-bx">
                                                        <h6>{getLangText(item.title, userLanguage) || "Course Title"}</h6>
                                                        <p>
                                                            <FontAwesomeIcon icon={faUser} className="user-summary-icon" /> 
                                                            {typeof item.instructor === 'string' ? item.instructor : "Instructor"}
                                                        </p>

                                                        <ul className="rating-list">
                                                            <li className="rating-item">
                                                                <a href="#" className="rating-text"> 
                                                                    <FontAwesomeIcon icon={faStar} /> 
                                                                </a>
                                                            </li>
                                                            <li className="rating-item">
                                                                <a href="#" className="rating-text"> 
                                                                    <FontAwesomeIcon icon={faStar} /> 
                                                                </a>
                                                            </li>
                                                            <li className="rating-item">
                                                                <a href="#" className="rating-text"> 
                                                                    <FontAwesomeIcon icon={faStar} /> 
                                                                </a>
                                                            </li>
                                                            <li className="rating-item">
                                                                <a href="#" className="rating-text"> 
                                                                    <FontAwesomeIcon icon={faStar} /> 
                                                                </a>
                                                            </li>
                                                            <li className="rating-item">
                                                                <a href="#" className="rating-text"> 
                                                                    <FontAwesomeIcon icon={faStarHalf} /> 
                                                                </a>
                                                            </li>
                                                            <li className="rating-item">
                                                                <span className="rating-number">(4.5)</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* <div className="course-cart-price">
                                                    <p>
                                                        ${typeof item.price === 'string' ? item.price : (parseFloat(item.price) || 0).toFixed(2)} 
                                                        
                                                    </p>
                                                </div> */}


                                                <div className="course-cart-price">
                                        <div className="course-offer-price">
                                         <div>
                                            {/* <p>$24.92 <del className="price-sell">$32.90</del> </p> */}
                                             <p>
                                                        ${typeof item.price === 'string' ? item.price : (parseFloat(item.price) || 0).toFixed(2)} <del className="price-sell">$32.90</del> 
                                                        
                                                    </p>
                                        </div>
                                        <div>
                                            <button 
                                                            className="cart-remove-btn ms-3"
                                                            onClick={() => removeFromCart(item._id)}
                                                            title="Remove from cart"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> 
                                                        </button>
                                        </div>
                                       </div>

                                    </div>


                                            </div>
                                        ))}
                                    </div>

                                    <div className="course-card">
                                        <div className="sub-total-box">
                                            <div>
                                                <h5>Sub Total ({cartItems.length} items)</h5>
                                            </div>
                                            <div>
                                                <h6>${calculateTotal().toFixed(2)}</h6>
                                            </div>
                                        </div>

                                        <div className="mt-4 d-flex align-items-center justify-content-end gap-3">
                                            {/* <div>
                                                <button 
                                                    className="thm-btn outline"
                                                    onClick={clearCart}
                                                    disabled={cartItems.length === 0}
                                                >
                                                    Clear Cart
                                                </button>
                                            </div> */}
                                            <div className="d-flex align-items-center gap-3 cart-shoping-box">
                                                <Link to="/" className="thm-btn outline">
                                                    Continue Shopping
                                                </Link>
                                               <Link
  to="/buy-course"
  state={{ courseIds: cartItems.map(item => item._id) }}
  className="thm-btn"
>
Proceed to Checkout
</Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AddCart