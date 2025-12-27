import { useEffect, useState } from "react";
import { UpOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  // Hiện nút khi cuộn xuống 300px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {visible && (
        <FloatButton
          shape="circle"
          type="primary"
          icon={<UpOutlined />}
          style={{ right: 24, bottom: 24 }}
          onClick={scrollToTop}
        />
      )}
    </>
  );
}

export default ScrollToTopButton;
