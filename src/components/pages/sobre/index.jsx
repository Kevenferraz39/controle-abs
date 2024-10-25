import { Helmet } from 'react-helmet';
import '../../../estilo.css'; // Corrigido para garantir que o CSS seja importado corretamente
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import Main from '../../Main'
const Sobre = () => {
    return(
        <>
            <Helmet>
                <title>Sobre</title>
            </Helmet>
            <main>
                <img src="" alt="" />
            </main>
            <Footer/>
        <Navbar/>
        </>
    )
}
export default Sobre