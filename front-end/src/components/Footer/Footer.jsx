import logo from "../../imgs/logo.png";

function Footer() {
  return (
    <div className="w-full bg-[linear-gradient(85deg,#31426F_32.67%,#495B8D_131.74%)] text-white py-10 px-6 md:px-[70px] flex flex-col md:flex-row justify-between items-center md:items-start gap-8 border-t border-blue-800/30">
      <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
        <h2 className="text-xl font-bold tracking-wide uppercase">
          Trung tâm ngoại ngữ DREAM
        </h2>

        <div className="text-blue-100 font-medium text-sm md:text-base">
          Địa chỉ: Số 23/18, Xã Nhị Long, Tỉnh Vĩnh Long
        </div>

        <img
          src={logo}
          alt="Dream Logo"
          className="w-[150px] md:w-[170px] mt-2 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md"
        />

        <p className="text-xs text-blue-200 mt-2 font-light">
          Copyright by DREAM © 2025. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center md:items-start">
        <div className="font-bold text-lg uppercase border-b border-blue-400 pb-1 mb-1 w-fit">
          Liên hệ
        </div>

        <div className="flex items-center gap-3 hover:text-blue-200 transition-colors cursor-pointer group">
          <div className="p-2 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
            <ion-icon
              name="logo-facebook"
              style={{ fontSize: "20px" }}
            ></ion-icon>
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61564511007288"
            className="font-medium"
          >
            Trung tâm ngoại ngữ Dream
          </a>
        </div>

        <div className="flex items-center gap-3 hover:text-blue-200 transition-colors cursor-pointer group">
          <div className="p-2 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
            <ion-icon name="call" style={{ fontSize: "20px" }}></ion-icon>
          </div>
          <a href="tel:0794325729" className="font-medium">
            0794 325 729
          </a>
        </div>

        <div className="flex items-center gap-3 hover:text-blue-200 transition-colors cursor-pointer group">
          <div className="p-2 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
            <ion-icon name="mail" style={{ fontSize: "20px" }}></ion-icon>
          </div>
          <a href="mailto:duytinnguyen84@gmail.com" className="font-medium">
            dream@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;
