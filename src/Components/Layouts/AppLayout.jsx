import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react";
import Footer from "./Footer"
import Header from "./Header";
import HeaderSecond from "./HeaderSecond";
import { useAuth } from '../../contexts/AuthContext';

function AppLayout() {
    const { isAuthenticated } = useAuth();

    const location = useLocation();
    const path = location.pathname;
    const staticRoute = []

    console.log(path)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [path]);


    return (
        <>
            <div className="app-layout">
                {!staticRoute.includes(path) &&
                    (isAuthenticated ? <HeaderSecond /> : <Header />)
                   
                }
                <div className="page-content">
                    <Outlet />
                </div>
                {!staticRoute.includes(path) && <Footer />}
            </div>







        </>


    )
}

export default AppLayout