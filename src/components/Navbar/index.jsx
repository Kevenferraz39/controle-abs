import { Link, useLocation } from 'react-router-dom';
import Logo from "../../assets/img/ControlABS.png";
import '../../estilo.css'; 

const Navbar = () => {
    const location = useLocation(); // Pega a URL atual

    // Função para verificar se a rota está ativa
    const isActive = (pathname) => location.pathname === pathname ? 'active-link' : '';

    return (
        <>
            <header>
                <div className="container-header">
                    <div className="img">
                        <Link to="/home">
                            <img src={Logo} alt="ID/EA" />
                        </Link>
                    </div>
                    <div className="menu">
                        <Link to="/home" className={`lk ${isActive('/home')}`}>Home</Link>
                        <Link to="/" className={`lk ${isActive('/')}`}>Controle ABS</Link>
                        <Link to="/historico" className={`lk ${isActive('/historico')}`}>Historico</Link>
                        <Link to="/Feedback" className={`lk ${isActive('/Feedback')}`}>Feedback</Link>
                        <button onClick={() => window.location.href = "https://sites.google.com/mercadolivre.com/idea-sp10?usp=sharing"}>
                            Voltar ao site
                        </button>

                        <Link to="/sobre" className={`lk ${isActive('/sobre')}`}>Sobre</Link>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
