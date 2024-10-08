import { Link } from 'react-router-dom';
import '../../estilo.css'; // Corrigido para garantir que o CSS seja importado corretamente

const SideBar = () => {
    return (
        <>
            <div className="side-bar">
                <div className="container-side">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/relatorio">Relatório</Link></li>
                        <li><Link to="/Write">Write page</Link></li>
                        <li><Link to="/Read">Read page</Link></li>
                        <li><Link to="/UpdateRead">Update page</Link></li>
                    </ul>
                </div>
            </div>
        
        </>
    )
}

export default SideBar;