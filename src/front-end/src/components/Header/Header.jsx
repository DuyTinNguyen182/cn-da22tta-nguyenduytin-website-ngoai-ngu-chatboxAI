import { useEffect, useState, useRef } from "react";
import logo from "../../imgs/logo_h.png";
import apiClient from "../../api/axiosConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CouponTicker from "./CouponTicker";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [popupDisplay, setPopupDisplay] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showTicker, setShowTicker] = useState(true);
  const lastScrollY = useRef(0);

  const { state, dispatch } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
        setShowTicker(false);
      } else {
        setShowTicker(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.get(`/auth/logout`);
      dispatch({ type: "AUTH_FAILURE" });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginClick = () => {
    const stateData = { action: "redirect", url: location.pathname };
    navigate("/login", { state: stateData });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const avatarWrapper = document.getElementById("avatar-wrapper");
      if (avatarWrapper && !avatarWrapper.contains(event.target)) {
        setPopupDisplay(false);
      }
    };
    if (popupDisplay)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupDisplay]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
      isActive(path) ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all">
      <div className="h-[55px] bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm relative z-20">
        <div className="flex-shrink-0">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="w-[140px] md:w-[170px] object-contain"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-0 lg:gap-8">
          <Link className={navItemClass("/")} to="/">
            <ion-icon name="home" style={{ fontSize: "20px" }}></ion-icon>
            <span>Trang chủ</span>
          </Link>
          <Link className={navItemClass("/courses")} to="/courses">
            <ion-icon name="book" style={{ fontSize: "20px" }}></ion-icon>
            <span>Khóa học</span>
          </Link>
          {currentUser && (
            <Link
              className={navItemClass(`/my-courses/${currentUser?._id}`)}
              to={`/my-courses/${currentUser?._id}`}
            >
              <ion-icon name="school" style={{ fontSize: "20px" }}></ion-icon>
              <span className="whitespace-nowrap">Khóa học của tôi</span>
            </Link>
          )}
          <Link className={navItemClass("/contact")} to="/contact">
            <ion-icon name="call" style={{ fontSize: "20px" }}></ion-icon>
            <span>Liên hệ</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div
              id="avatar-wrapper"
              className="relative flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition"
              onClick={() => setPopupDisplay(!popupDisplay)}
            >
              <div className="hidden sm:block px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                Hi, {currentUser.fullname.split(" ").pop()}
              </div>
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-200 shadow-sm"
              />

              {popupDisplay && (
                <div
                  className="absolute top-[60px] right-0 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-base truncate max-w-[160px]">
                        {currentUser.fullname}
                      </span>
                      {currentUser.role === "Student" && (
                        <span className="text-lg text-gray-900">
                          MSHV: {currentUser.userid}
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md w-fit mt-1 text-white ${
                          currentUser.role === "Admin"
                            ? "bg-black"
                            : "bg-green-500"
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {currentUser.role === "Admin" && (
                      <a
                        href="/admin/overview"
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ion-icon
                          name="settings-outline"
                          style={{ fontSize: "20px" }}
                        ></ion-icon>{" "}
                        Admin Dashboard
                      </a>
                    )}
                    <Link
                      to={`/user/account/${currentUser._id}`}
                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => setPopupDisplay(false)}
                    >
                      <ion-icon
                        name="person-circle-outline"
                        style={{ fontSize: "20px" }}
                      ></ion-icon>{" "}
                      Tài khoản
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <div
                      className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopupDisplay(false);
                        handleLogout();
                      }}
                    >
                      <ion-icon
                        name="log-out-outline"
                        style={{ fontSize: "20px" }}
                      ></ion-icon>{" "}
                      <span>Đăng xuất</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="hidden sm:block px-5 py-2 text-sm font-medium cursor-pointer text-slate-700 bg-white border border-slate-300 rounded-full hover:bg-slate-50 transition active:scale-95"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </button>
              <button
                className="px-5 py-2 text-sm font-medium text-white cursor-pointer bg-gradient-to-r from-blue-900 to-blue-600 rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition active:scale-95 whitespace-nowrap"
                onClick={() => handleLoginClick()}
              >
                Đăng nhập
              </button>
            </div>
          )}

          <div className="md:hidden flex items-center ml-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-3xl text-gray-700 focus:outline-none"
            >
              <ion-icon name={mobileMenuOpen ? "close" : "menu"}></ion-icon>
            </button>
          </div>
        </div>
      </div>

      <CouponTicker isVisible={showTicker} />

      {mobileMenuOpen && (
        <div className="absolute top-[55px] left-0 w-full bg-white border-b border-gray-200 shadow-xl flex flex-col p-4 md:hidden animate-in slide-in-from-top-5 duration-200 z-10">
          <Link
            className={navItemClass("/")}
            to="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ion-icon name="home"></ion-icon> Trang chủ
          </Link>
          <Link
            className={navItemClass("/courses")}
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ion-icon name="book"></ion-icon> Khóa học
          </Link>
          {currentUser && (
            <Link
              className={navItemClass(`/my-courses/${currentUser?._id}`)}
              to={`/my-courses/${currentUser?._id}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ion-icon name="school"></ion-icon> Khóa học của tôi
            </Link>
          )}
          <Link
            className={navItemClass("/contact")}
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ion-icon name="call"></ion-icon> Liên hệ
          </Link>
          {!currentUser && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                className="w-full py-2 text-center font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
              >
                Đăng ký ngay
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
