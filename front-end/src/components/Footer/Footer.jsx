
import logo from "../../imgs/logo.png"
import './Footer.css'

function Footer(){
    return(
        <div className="Footer">
            <div className='Footer_left'>
                <h2>Trung tâm ngoại ngữ DREAM</h2>
                <div>Địa chỉ: Số 126, Nguyễn Thiện Thành, Phường Hòa Thuận, Tỉnh Vĩnh Long</div>
                <img src={logo} alt=""/>
                <p>Copyright by DuyTinNguyen © 2025. All right reserved.</p>
            </div>
            <div className='Footer_right'>
                <div>Liên hệ:</div>
                <div>
                    <ion-icon name="logo-facebook"></ion-icon>
                    <span>Trung tâm ngoại ngữ Dream</span>
                </div>
                <div>
                    <ion-icon name="call"></ion-icon>
                    <span>0794 325 729</span>
                </div>
                <div>
                    <ion-icon name="mail"></ion-icon>
                    <span>dream@gmail.com</span>
                </div>
            </div>
        </div>
    )
}

export default Footer;