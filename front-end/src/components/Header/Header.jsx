import { useEffect, useState } from "react";
import "./Header.css";

import logo from "../../imgs/logo_h.png";
import apiClient from "../../api/axiosConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [popupDisplay, setPopupDisplay] = useState(false);

  const { state, dispatch } = useAuth();
  const { currentUser } = state;

  const handleLogout = async () => {
    try {
      await apiClient.get(`/auth/logout`); 
      
      // Dispatch hành động để xóa user khỏi trạng thái toàn cục
      dispatch({ type: 'AUTH_FAILURE' }); 
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginClick = () => {
    const stateData = {
      action: "redirect",
      url: location.pathname,
    };

    navigate("/login", { state: stateData });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const avatar = document.querySelector(".Header_avatar img");
      const popup = document.querySelector(".Header_avatar_popup");

      if (
        popup &&
        !popup.contains(event.target) &&
        avatar &&
        !avatar.contains(event.target)
      ) {
        setPopupDisplay(false);
      }
    };

    if (popupDisplay) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupDisplay]);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="Header">
      {/* Logo */}
      <div className="Header_logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Thanh điều hướng */}
      <div className="Header_nav">
        <Link
          className={`Header_nav_item ${isActive("/") ? "active" : ""}`}
          to="/"
        >
          <ion-icon name="home"></ion-icon>
          <span>Trang chủ</span>
        </Link>

        <Link
          className={`Header_nav_item ${isActive("/courses") ? "active" : ""}`}
          to="/courses"
        >
          <ion-icon name="book"></ion-icon>
          <span>Khóa học</span>
        </Link>
        {currentUser && (
          <>
            <Link
              className={`Header_nav_item ${
                isActive(`/my-courses/${currentUser?._id}`) ? "active" : ""
              }`}
              to={`/my-courses/${currentUser?._id}`}
            >
              <ion-icon name="school"></ion-icon>
              <span>Khóa học của tôi</span>
            </Link>
          </>
        )}
      </div>

      {/* Tài khoản */}
      {currentUser ? (
        <div className="Header_avatar">
          <img
            src={currentUser.avatar}
            alt=""
            onClick={() => setPopupDisplay(!popupDisplay)}
          />
          {popupDisplay && (
            <>
              <div
                className="overlay"
                onClick={() => setPopupDisplay(!popupDisplay)}
              ></div>
              <div className="Header_avatar_popup">
                <div className="avatar_popup_name">
                  <img src={currentUser.avatar} alt="" />
                  <div>
                    <div>{currentUser.fullname}</div>
                    {currentUser.role === "Student" && (
                      <div>Mã học viên: {currentUser.userid}</div>
                    )}
                    <span
                      className={
                        currentUser.role === "Admin" ? "badge-admin" : ""
                      }
                    >
                      {currentUser.role}
                    </span>                    
                  </div>
                </div>
                {currentUser.role === "Admin" && (
                  <a href="/admin/overview" onClick={() => setPopupDisplay(false)}>
                    <ion-icon name="settings-outline"></ion-icon>
                    <span>Admin Dashboard</span>
                  </a>
                )}
                <Link
                  to={`/user/account/${currentUser._id}`}
                  onClick={() => setPopupDisplay(false)}
                >
                  <ion-icon name="person-circle-outline"></ion-icon>
                  <span>Tài khoản</span>
                </Link>

                <div
                  className="avatar_popup_option"
                  onClick={() => {
                    setPopupDisplay(false);
                    handleLogout();
                  }}
                >
                  <a href="/">
                    <ion-icon name="log-out-outline"></ion-icon>
                    <span>Đăng xuất</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="Header_auth_buttons">
          <button className="Login_button" onClick={() => handleLoginClick()}>
            Đăng nhập
          </button>
          <button
            className="Register_button"
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;