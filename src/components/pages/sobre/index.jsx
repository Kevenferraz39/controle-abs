import { Helmet } from 'react-helmet';
import '../../../estilo.css'; // Corrigido para garantir que o CSS seja importado corretamente
import Navbar from '../../Navbar';
import Footer from '../../Footer';
const Sobre = () => {
    return(
        <>
            <Helmet>
                <title>Sobre</title>
            </Helmet>
            <main>
                <center><h1 className='emconstruction'>ESTÁ PÁGINA ESTÁ EM DESENVOLVIMENTO !</h1></center>
            </main>
            <Footer/>
        <Navbar/>
        </>
    )
}
export default Sobre