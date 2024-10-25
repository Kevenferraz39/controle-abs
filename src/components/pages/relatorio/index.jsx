import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import app from "../../../firebaseConfig.jsx";
import { getDatabase, ref, get, set } from "firebase/database";
import '../../../estilo.css';
import Navbar from '../../Navbar';
import Footer from '../../Footer';

const RelatorioEUpdate = () => {
    const [representantesArray, setRepresentantesArray] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchRE, setSearchRE] = useState("");
    const [searchData, setSearchData] = useState("");
    const [showDateField, setShowDateField] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [buttonLabel, setButtonLabel] = useState("GERAR RELATÓRIO");
    const [showGenerateButton, setShowGenerateButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

useEffect(() => {
    const currentDate = getCurrentDate();
    setSearchData(currentDate);
}, []);

const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};


    const getTeamLeaderByRE = (re) => {
        const representante = representantesArray.find(item => item.RE_TL === re);
        return representante ? representante.Team_Leader : "";
    };

    useEffect(() => {
        setSearchData(getCurrentDate());
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const db = getDatabase(app);
            const dbRef = ref(db, "Chamada/Representante/Representantes");
            const snapshot = await get(dbRef);
    
            if (!snapshot.exists()) {
                setError("Nenhum dado disponível.");
                return;
            }
    
            const myData = snapshot.val();
            const temporaryArray = Object.keys(myData).map(myFireid => ({
                ...myData[myFireid],
                RepresentantesId: myFireid
            }));
    
            if (searchData) {
                const historicoRef = ref(db, `Historico/Chamada/${searchData}`);
                const historicoSnapshot = await get(historicoRef);
                let historicoData = [];
    
                if (historicoSnapshot.exists()) {
                    historicoData = historicoSnapshot.val();
                    historicoData = Object.keys(historicoData).map(historicoId => ({
                        ...historicoData[historicoId],
                        RepresentantesId: historicoId,
                        DATA: searchData
                    }));
                }
    
                const combinedData = temporaryArray.map(item => {
                    const historicoItem = historicoData.find(h => h.RepresentantesId === item.RepresentantesId) || {};
                    return {
                        ...item,
                        Presenca: historicoItem.Presenca || "",
                        Justificativa: historicoItem.Justificativa || ""
                    };
                });
    
                setRepresentantesArray(combinedData);
                applyFilters(combinedData);
            } else {
                setRepresentantesArray(temporaryArray);
                applyFilters(temporaryArray);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setError("Erro ao buscar dados. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
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
        
        const faltas = filtered.filter(item => item.Presenca !== "Presente");

        if (faltas.length > 0) {
            setFilteredData(faltas);
        } else {
            const totalPresentes = filtered.filter(item => item.Presenca === "Presente").length;

            if (totalPresentes === filtered.length && totalPresentes > 0) {
                alert(`Olá, ${capitalizeName(getTeamLeaderByRE(searchRE))}, a sua equipe está completa e conta com ${totalPresentes} colaboradores presentes.`);
                setFilteredData([]);
            } else {
                setFilteredData(filtered);
            }
        }

        setReportGenerated(true);
        setShowGenerateButton(false);
    };

    const handleGenerateReport = async () => {
        await fetchData();
        setViewOnly(false);
        setPendingChanges({});
        setButtonLabel("GERAR RELATÓRIO");
        setShowGenerateButton(false);
    };

    const handleStatusChange = (RepresentantesId, newStatus) => {
        setPendingChanges(prev => ({
            ...prev,
            [RepresentantesId]: {
                ...prev[RepresentantesId],
                Presenca: newStatus
            }
        }));
    };

    const handleSave = async () => {
        const db = getDatabase(app);
        
        for (const RepresentantesId in pendingChanges) {
            const RepresentantesData = pendingChanges[RepresentantesId];
            const RepresentantesOriginal = representantesArray.find(item => item.RepresentantesId === RepresentantesId);

            const fullRepresentantesData = {
                ...RepresentantesOriginal,
                Presenca: RepresentantesData.Presenca || RepresentantesOriginal.Presenca || "",
                Justificativa: RepresentantesData.Justificativa || RepresentantesOriginal.Justificativa || ""
            };

            const dbRef = ref(db, `Historico/Chamada/${fullRepresentantesData.DATA}/${RepresentantesId}`);
            await set(dbRef, fullRepresentantesData);
        }
        
        alert("Alterações salvas com sucesso!");
        setPendingChanges({});
        await fetchData();
    };

    const addJustificativa = (RepresentantesId) => {
        const justificativa = prompt("Por favor, insira a justificativa:");
        if (justificativa) {
            setPendingChanges(prev => ({
                ...prev,
                [RepresentantesId]: {
                    ...prev[RepresentantesId],
                    Justificativa: justificativa
                }
            }));
        } else {
            alert("Nenhuma justificativa inserida!");
        }
    };

    const handleViewRecords = () => {
        fetchData();
        setViewOnly(true);
        setButtonLabel("ATUALIZAR DADOS");
        setShowGenerateButton(true);
        setShowDateField(true);
    };

    useEffect(() => {
        if (searchRE.trim() && !viewOnly) {
            setShowGenerateButton(true);
            setButtonLabel("GERAR RELATÓRIO");
        } else if (viewOnly) {
            setButtonLabel("ATUALIZAR DADOS");
        }
    }, [searchRE, viewOnly]);
    
    const capitalizeName = (name) => name.toUpperCase();

    return (
        <>
            <Helmet>
                <title>Controle ABS</title>
            </Helmet>
            <Navbar />
            <main>
                <div className="container-main">
                    {error && <div className="error-message">{error}</div>}
                    <div className="campo-de-pesquisa">
                        <label htmlFor="RETL">RE:</label>
                        <input type="text" id="RETL" value={searchRE} onChange={(e) => setSearchRE(e.target.value)} placeholder="Digite seu RE"/>

                        {showDateField && (
                            <>
                                <label htmlFor="data">DATA:</label>
                                <input type="date" id="data" value={searchData} onChange={(e) => setSearchData(e.target.value)}/>
                            </>
                        )}

                        {showGenerateButton && (
                            <button onClick={handleGenerateReport} disabled={loading}>{buttonLabel}</button>
                        )}
                        {reportGenerated && !viewOnly && (
                            <>
                                <button onClick={handleSave}>SALVAR</button>
                                <button onClick={handleViewRecords}>VER REGISTROS</button>
                            </>
                        )}
                        {viewOnly && (
                            <button onClick={handleGenerateReport} disabled={loading}>{buttonLabel}</button>
                        )}
                    </div>
                    {loading && <div>Carregando...</div>}
                    {reportGenerated && (
                        <>
                            <h2>
                                Olá, <span>{capitalizeName(getTeamLeaderByRE(searchRE))}</span>, aqui está o relatório <span>ABS</span> da data <span>{formatDate(searchData)}</span>&nbsp;!
                            </h2>
                            <div className="container-tabela">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID Groot</th>
                                            <th>Nome</th>
                                            <th>RE</th>
                                            <th>Turno</th>
                                            <th>Escala Padrão</th>
                                            <th>Cargo Padrão</th>
                                            <th>Área Padrão</th>
                                            <th>Empresa</th>
                                            <th>Turma</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                            <th className="presensa-sistemic">Presença Sistêmica</th>
                                            <th>Validação</th>
                                            <th>Justificativa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.ID_Groot}</td>
                                                <td>{capitalizeName(item.Nome)}</td>
                                                <td>{item.Matricula}</td>
                                                <td>{item.Turno}</td>
                                                <td>{item.Escala_Padrao}</td>
                                                <td>{item.Cargo_Padrao}</td>
                                                <td>{item.Area_Padrao}</td>
                                                <td>{item.Empresa}</td>
                                                <td>{item.Turma}</td>
                                                <td>{item.Status}</td>
                                                <td>{formatDate(item.DATA)}</td>
                                                <td className="presensa-sistemic">{item.Presenca}</td>
                                                <td>
                                                    <select value={pendingChanges[item.RepresentantesId]?.Presenca || ""}
                                                        onChange={(e) => handleStatusChange(item.RepresentantesId, e.target.value)}>
                                                        <option value="">Selecione</option>
                                                        <option value="Presente">Presente</option>
                                                        <option value="Afastamento">Afastamento</option>
                                                        <option value="Afastamento-Acd-Trab">Afastamento Acd Trabalho</option>
                                                        <option value="Atestado">Atestado</option>
                                                        <option value="Atestado-Acd-Trab">Atestado Acd Trabalho</option>
                                                        <option value="Atestado-Horas">Atestado Horas</option>
                                                        <option value="Banco-de-Horas">Banco de Horas</option>
                                                        <option value="Decl-Medica">Declaração Médica</option>
                                                        <option value="Falta">Falta</option>
                                                        <option value="Ferias">Férias</option>
                                                        <option value="Folga-Escala">Folga Escala</option>
                                                        <option value="Fretado">Fretado</option>
                                                        <option value="Licenca">Licença</option>
                                                        <option value="Presenca-HE">Presença (HE)</option>
                                                    </select>
                                                </td>
                                                {!viewOnly && (
                                                    <td>
                                                        <button onClick={() => addJustificativa(item.RepresentantesId)}>Adicionar Justificativa</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default RelatorioEUpdate;
