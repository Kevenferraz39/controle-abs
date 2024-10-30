import style from './Footer.module.css'; 
import Logo from '../../assets/img/logofooter.png'

const Footer = () => {
    return ( 
        <footer className={style.Footer}>
            <div className={style['footer-container']}>
                <div className={style['logo-space']}>
                    <img src={Logo} alt="logo alternativa" className={style.logofoter} />
                    <p></p>
                </div>
                <div className={style.information}>
                    <ol>
                        <h3>Gestão</h3>
                        <li><a href="https://lookerstudio.google.com/u/0/reporting/addc1e45-1c23-4654-9b8e-c4320389d778/page/p_s3d5oqq09c">Setup Time</a></li>
                        <li><a href="https://lookerstudio.google.com/reporting/adee4ffc-6a1f-4984-a99e-dc754f782d42">Meal Accuraycy</a></li>
                        <li><a href="https://lookerstudio.google.com/u/0/reporting/2e395b9e-8d62-488e-b24a-dd3ce2adaef8/page/p_960xu7q98c">Monitor de Eficiência</a></li>
                        <li><a href="https://lookerstudio.google.com/u/0/reporting/2e395b9e-8d62-488e-b24a-dd3ce2adaef8/page/p_ly9lunpzld">Rep Evolution</a></li>
                    </ol>

                    <ol>
                        <h3>Visão Geral</h3>
                        <li><a href="https://lookerstudio.google.com/reporting/92a1f5fe-a331-4f37-9d13-37d0e20f2137">SLA Processos</a></li>
                        <li><a href="https://lookerstudio.google.com/reporting/e73a5633-90fe-4914-af08-9ff9d9b6b13e">Aging de Orders</a></li>
                        <li><a href="https://lookerstudio.google.com/reporting/711487b7-cd31-4cb1-85d1-9ea894e077af/page/tEnnC">Stock Audit</a></li>
                        <li><a href="https://sites.google.com/mercadolivre.com/idea-sp10/idea/formul%C3%A1rio">Solicitação de Demanda</a></li>
                    </ol>
                </div>
            </div>
            <br/>
            <hr/>
            <br/>
            <center><p>© <b>Control Tower SP10.</b></p></center>
        </footer>
    );
};

export default Footer;