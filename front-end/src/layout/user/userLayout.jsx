import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Home from "./Home/Home";
import Courses from "./Courses/Courses";
import CourseDetail from "./CourseDetail/CourseDetail";
import RegisteredCourses from "./RegisteredCourses/RegisteredCourses";
import ContactPage from "./ContactPage/ContactPage";
import UserAcc from "./UserAccount/UserAccount";
import Chatbot from "../../components/Chatbot/Chatbot";
import "./userLayout.css";

function UserLayout() {
  const userContentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (userContentRef.current) {
      userContentRef.current.scrollTop = 0;
    }
  }, [location]);

  return (
    <div className="UserLayout">
      <div className="User-content" ref={userContentRef}>
        <div className="User-content-top">  
          <Header />
        </div>
        <div className="content-fill">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />  
            <Route path="/my-courses/:id" element={<RegisteredCourses />} />
            <Route path="/user/account/:id" element={<UserAcc />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Chatbot />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default UserLayout;
