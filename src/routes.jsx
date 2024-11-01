import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/pages/home";
import Relatorio from "./components/pages/relatorio";
import Sobre from "./components/pages/sobre"
import Write from "./components/pages/Write"; 
import Read from "./components/pages/Read";
import UpdateRead from "./components/pages/UpdateRead";
import UpdateWrite from "./components/pages/UpdateWrite";
import DashABS from "./components/pages/DashABS";
import Error404 from "./components/pages/Error404";
import Error404Alternate from "./components/pages/Error404Alternate";
import Historico from "./components/pages/Historico";

const RoutesApp = () => {
    const random404 = Math.random() < 0.5 ? <Error404 /> : <Error404Alternate />

    return(
        <BrowserRouter>
            <Routes> 
                <Route path="*" element={random404}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/" element={<Relatorio/>}/>
                <Route path="/sobre" element={<Sobre/>}/>
                <Route path="/write" element={<Write/>}/>
                <Route path="/read" element={<Read/>}/>
                <Route path="/updatewrite/:firebaseid" element={<UpdateWrite/>}/>
                <Route path="/updateread" element={<UpdateRead/>}/>
                <Route path="/dashABS" element={<DashABS/>}/>
                <Route path="/historico" element={<Historico/>}/>
               
            </Routes>
        </BrowserRouter>
    )

}

export default RoutesApp;