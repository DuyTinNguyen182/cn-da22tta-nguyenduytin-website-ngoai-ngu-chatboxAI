import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../context/AuthContext';
import './CourseDetail.css';

function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    const { state } = useAuth();
    const { currentUser } = state;
    const userId = currentUser?._id;

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                //lấy chi tiết 1 khóa học bằng _id
                const response = await apiClient.get(`/course/${courseId}`);
                setCourse(response.data);
            } catch (error) {
                messageApi.error("Không thể tải thông tin chi tiết khóa học.");
                console.error("Fetch course detail error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetail();
    }, [courseId]);

    const handleRegister = async () => {
        if (!userId) {
            messageApi.error("Vui lòng đăng nhập để đăng ký khóa học!");
            return;
        }
        try {
            await apiClient.post("/registration", {
                user_id: userId,
                course_id: course._id,
            });
            messageApi.success("Đăng ký khóa học thành công!");
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Đăng ký thất bại.");
        }
    };

    // Nút quay lại
    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <Spin fullscreen tip="Đang tải chi tiết khóa học..." />;
    }

    if (!course) {
        return <div>Không tìm thấy thông tin khóa học.</div>;
    }
    
    // Xử lý dữ liệu để hiển thị
    const languageName = course.language_id?.language;
    const levelName = course.languagelevel_id?.language_level;
    const teacherName = course.teacher_id?.full_name;

    return (
        <div className="course-detail-page">
            {contextHolder}
            <Button 
                className="back-button"
                icon={<ArrowLeftOutlined />} 
                onClick={handleGoBack}
            >
                Quay lại
            </Button>

            <h1 className="course-title">{course.courseid} - {languageName} - {levelName}</h1>
            
            <div className="course-content-wrapper">
                <div className="course-description-panel">
                    <h2>Mô tả khóa học</h2>
                    <p>{course.Description || "Hiện chưa có mô tả chi tiết cho khóa học này."}</p>
                </div>
                <div className="course-info-panel">
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Giảng viên">{teacherName || 'Đang cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">{new Date(course.Start_Date).toLocaleDateString("vi-VN")}</Descriptions.Item>
                        <Descriptions.Item label="Số tiết">{course.Number_of_periods}</Descriptions.Item>
                        <Descriptions.Item label="Học phí">
                            <strong>{course.Tuition?.toLocaleString()} VNĐ</strong>
                        </Descriptions.Item>
                    </Descriptions>
                    <Button 
                        type="primary" 
                        size="large" 
                        className="register-button"
                        onClick={handleRegister}
                    >
                        Đăng ký ngay
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;