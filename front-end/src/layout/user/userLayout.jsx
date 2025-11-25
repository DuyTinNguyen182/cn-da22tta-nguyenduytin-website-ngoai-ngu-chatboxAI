import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Chatbot from "../../components/Chatbot/Chatbot";

import Home from "./Home/Home";
import Courses from "./Courses/Courses";
import CourseDetail from "./CourseDetail/CourseDetail";
import RegisteredCourses from "./RegisteredCourses/RegisteredCourses";
import ContactPage from "./ContactPage/ContactPage";
import UserAcc from "./UserAccount/UserAccount";

function UserLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F2F4F7]">
      <Header />
      <main className="flex-1 w-full pt-[90px] pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/my-courses/:id" element={<RegisteredCourses />} />
          <Route path="/user/account/:id" element={<UserAcc />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
