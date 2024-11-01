import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import app from "../../../firebaseConfig.jsx";
import { getDatabase, ref, get, set } from "firebase/database";
import '../../../estilo.css';
import Navbar from '../../Navbar';
import Footer from '../../Footer';

const HistoricoABS = () => {
    const [searchRE, setSearchRE] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [searchData, setSearchData] = useState(""); // Mantém a data selecionada
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [representantesArray, setRepresentantesArray] = useState([]);
    const [pendingChanges, setPendingChanges] = useState({}); // Para armazenar alterações
    const [reportGenerated, setReportGenerated] = useState(false);
    const [showGenerateButton, setShowGenerateButton] = useState(true);

    const formatDate = (dateString) => {
        const date = new Date(dateString + "T00:00:00");
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null); 
        try {
            const db = getDatabase(app);

            // Buscar diretamente os dados para a data selecionada
            const historicoRef = ref(db, `Historico/Chamada/${searchData}`);
            const snapshot = await get(historicoRef);

            if (!snapshot.exists()) {
                setError("Nenhum dado disponível para esta data.");
                return;
            }

            const historicoData = snapshot.val();
            const dataArray = Object.keys(historicoData).map(historicoId => ({
                ...historicoData[historicoId],
                RepresentantesId: historicoId,
                DATA: searchData
            }));

            // Filtrar pelos dados de RE se necessário
            if (searchRE) {
                const filtered = dataArray.filter(item => item.RE_TL && item.RE_TL.toString().includes(searchRE));
                setFilteredData(filtered);
            } else {
                setFilteredData(dataArray);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setError("Erro ao buscar dados. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    const getTeamLeaderByRE = (re) => {
        const representante = representantesArray.find(item => item.RE_TL === re);
        return representante ? representante.Team_Leader : "";
    };

    const applyFilters = (data) => {
        if (!searchRE.trim()) {
            alert("Por favor, preencha o RE.");
            return;
        }

        const representante = data.find(item => item.RE_TL === searchRE);
        if (!representante) {
            alert("RE não encontrado.");
            return;
        }

        const teamLeader = representante.Team_Leader;
        const filtered = data.filter(item => item.Team_Leader === teamLeader && item.DATA === searchData);

        const Status = filtered.filter(item => 
            ["ATIVO", "AFASTADO", "TRANSFERIDO", "TRANSFERÊNCIA SORTATION", "AFASTADA GRAVIDEZ", "TRANSFERÊNCIA BRRC01"].includes(item.Status)
        );

        if (Status.length > 0) {
            setFilteredData(Status);
        } else {
            console.log("Nenhum status encontrado.");
        }

        setReportGenerated(true);
        setShowGenerateButton(false);
    };

    const handleSearch = async () => {
        if (!searchData) {
            setError("Por favor, selecione uma data.");
            return;
        }
        await fetchData();
    };

    const handleUpdateData = async () => {
        const db = getDatabase(app);
        try {
            await Promise.all(filteredData.map(async (item) => {
                const refPath = ref(db, `Historico/Chamada/${searchData}/${item.RepresentantesId}`);
                await set(refPath, {
                    ...item,
                    ...pendingChanges[item.RepresentantesId], // Aplicar alterações pendentes
                });
            }));
            alert("Dados atualizados com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar dados:", error);
            setError("Erro ao atualizar dados. Tente novamente mais tarde.");
        }
    };

    const capitalizeName = (name) => name.toUpperCase();

    const color = (Status) => {
        if (Status.trim().toLowerCase() === "ativo") {
            return "#00b23e"; // Cor para "Ativo"
        } else if (Status.trim().toLowerCase() === "desligado") {
            return "#ff0000"; // Vermelho para "Desligado"
        } else if (Status.trim().toLowerCase() === "afastado") {
            return "#ead729"; // Afastado
        } else {
            return "#dddbd8"; // Cor neutra para outros valores
        }
    };

    const colorr = (presenca) => {
        if (presenca.trim().toLowerCase() === "presente") {
            return "#03c748"; // Verde para "Presente"
        } else if (presenca.trim().toLowerCase() === "folga-escala") {
            return "#1bed65"; // Verde para "Folga"
        } else if (presenca.trim().toLowerCase() === "falta") {
            return "#ff0000"; // Vermelho para "Falta"
        } else if (presenca.trim().toLowerCase() === "ferias") {
            return "#ffbb00"; // Amarelo para "Férias" 90,07
        } else {
            return ""; // Cor neutra para outros valores
        }
    };

    const preenchimentoRE_REP = (Matricula) => {
        return Matricula.trim().toLowerCase() === "lms deve preencher !" ? "oscillating" : "";
    };

    return (
        <>
            <Helmet>
                <title>Historico ABS</title>
            </Helmet>
            <Navbar />
            <main>
                <div className="container-main">
                    {error && <div className="error-message">{error}</div>}
                    <div className="campo-de-pesquisa">
                        <label htmlFor="RETL">RE:</label>
                        <input type="text" id="RETL" value={searchRE} onChange={(e) => setSearchRE(e.target.value)}/>
                        <label htmlFor="data">Data:</label>
                        <input type="date" id="data"value={searchData}onChange={(e) => setSearchData(e.target.value)}/>
                        <button onClick={handleSearch} disabled={loading}>Buscar Histórico</button> <button onClick={handleUpdateData}>Atualizar Dados</button>
                    </div>
                    {loading && <center><div>Carregando...</div></center>}
                    {filteredData.length > 0 && (
                        <>
                            <h2>Olá, <span>{capitalizeName(getTeamLeaderByRE(searchRE))}</span>, aqui está seu <span>Histórico</span> do dia <span>{formatDate(searchData)}</span>&nbsp;!😊</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID Groot</th>
                                        <th>Nome</th>
                                        <th>RE</th>
                                        <th>Turno</th>
                                        <th>Escala</th>
                                        <th>Cargo</th>
                                        <th>Área</th>
                                        <th>Empresa</th>
                                        <th>Turma</th>
                                        <th>Status</th>
                                        <th>Data</th> 
                                        <th className="presensa-sistemic">Presença</th>
                                        <th>Justificativa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.ID_Groot}</td>
                                            <td>{capitalizeName(item.Nome)}</td>
                                            <td className={preenchimentoRE_REP(item.Matricula)}>{item.Matricula}</td>
                                            <td>{item.Turno}</td>
                                            <td><center>{item.Escala_Padrao}</center></td>
                                            <td>{item.Cargo_Padrao}</td>
                                            <td>{item.Area_Padrao}</td>
                                            <td>{item.Empresa}</td>
                                            <td><center>{item.Turma}</center></td>
                                            <td style={{ color: color(item.Status) }}>{item.Status}</td>
                                            <td>{formatDate(item.DATA)}</td>
                                            <td className="presensa-sistemic" style={{ color: colorr(item.Presenca) }}>{item.Presenca}</td>
                                            <td>{item.Justificativa}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table><br/><br/><br/>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default HistoricoABS;
