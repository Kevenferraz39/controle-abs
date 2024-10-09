// Suggested code may be subject to a license. Learn more: ~LicenseLog:3694009784.
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import Styles from "./Page404.module.css"
import logo from "../../../assets/img/logoABS.png"

const Error404 = () => {
    return(
        <>
            <Helmet>
                <title>404 || Page Not Found !</title>
            </Helmet>
            <header className={Styles.header}>
                <Link to="/"><img src={logo} alt="imagemLogo"className={Styles.imagemLogo}/></Link>
            </header>
            <section className={Styles.information_404}>
                 <div className={Styles.information_container_404}>
                    <h1>404</h1>
                    <p>Page not found!</p>
                </div>
            </section>
        </>
    )
}

export default Error404