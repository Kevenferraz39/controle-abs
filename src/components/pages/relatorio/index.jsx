import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import app from "../../../firebaseConfig.jsx";
import { getDatabase, ref, get, set } from "firebase/database";
import '../../../estilo.css';
import Navbar from '../../Navbar';
import SideBar from '../../SideBar';
import Footer from '../../Footer';

const RelatorioEUpdate = () => {
    const [representanteArray, setRepresentanteArray] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchNome, setSearchNome] = useState("");
    const [searchRE, setSearchRE] = useState("");
    const [searchData, setSearchData] = useState("");
    const [reportGenerated, setReportGenerated] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});

    const fetchData = async () => {
        try {
            const db = getDatabase(app);
            const dbRef = ref(db, "Chamada/Representante");
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const myData = snapshot.val();
                const temporaryArray = Object.keys(myData).map(myFireid => ({
                    ...myData[myFireid],
                    RepresentanteId: myFireid
                }));

                if (searchData) {
                    const historicoRef = ref(db, `Historico/Chamada/${searchData}`);
                    const historicoSnapshot = await get(historicoRef);
                    let historicoData = [];

                    if (historicoSnapshot.exists()) {
                        historicoData = historicoSnapshot.val();
                        historicoData = Object.keys(historicoData).map(historicoId => ({
                            ...historicoData[historicoId],
                            RepresentanteId: historicoId,
                            DATA: searchData
                        }));
                    }

                    const combinedData = temporaryArray.map(item => {
                        const historicoItem = historicoData.find(h => h.RepresentanteId === item.RepresentanteId) || {};
                        return {
                            ...item,
                            Presenca: historicoItem.Presenca || "",
                            Justificativa: historicoItem.Justificativa || ""
                        };
                    });

                    setRepresentanteArray(combinedData);
                    applyFilters(combinedData);
                } else {
                    setRepresentanteArray(temporaryArray);
                    applyFilters(temporaryArray);
                }
            } else {
                alert("Nenhum dado disponível");
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            alert("Erro ao buscar dados. Tente novamente mais tarde.");
        }
    };

    const applyFilters = (data) => {
        if (!searchNome.trim()) {
            alert("Por favor, preencha o nome do Team Leader.");
            return;
        }

        if (!searchData.trim()) {
            alert("Por favor, selecione uma data.");
            return;
        }

        const filtered = data.filter(item => {
            const isNomeMatch = item.Team_Leader && item.Team_Leader.toLowerCase().includes(searchNome.toLowerCase());
            const isDataMatch = item.DATA === searchData;
            return isNomeMatch && isDataMatch;
        });

        setFilteredData(filtered);
        setReportGenerated(true);
    };

    const handleGenerateReport = async () => {
        await fetchData();
        setViewOnly(false); // Garante que estamos no modo de edição após gerar o relatório
        setPendingChanges({}); // Reseta as mudanças pendentes ao gerar o relatório
    };

    const handleViewRecords = () => {
        fetchData();
        setViewOnly(true);
    };

    const handleStatusChange = (representanteId, newStatus) => {
        setPendingChanges(prev => ({
            ...prev,
            [representanteId]: {
                ...prev[representanteId],
                Presenca: newStatus
            }
        }));
    };

    const addJustificativa = (representanteId) => {
        const justificativa = prompt("Por favor, insira a justificativa:");
        if (justificativa) {
            setPendingChanges(prev => ({
                ...prev,
                [representanteId]: {
                    ...prev[representanteId],
                    Justificativa: justificativa
                }
            }));
        } else {
            alert("Nenhuma justificativa inserida.");
        }
    };

    const handleSave = async () => {
        const db = getDatabase(app);

        for (const representanteId in pendingChanges) {
            const representanteData = pendingChanges[representanteId];
            const representanteOriginal = representanteArray.find(item => item.RepresentanteId === representanteId);

            const fullRepresentanteData = {
                ID_Groot: representanteOriginal.ID_Groot || "",
                Nome: representanteOriginal.Nome || "",
                Matricula: representanteOriginal.Matricula || "",
                Turno: representanteOriginal.Turno || "",
                Escala_Padrao: representanteOriginal.Escala_Padrao || "",
                Cargo_Padrao: representanteOriginal.Cargo_Padrao || "",
                Area_Padrao: representanteOriginal.Area_Padrao || "",
                Empresa: representanteOriginal.Empresa || "",
                Status: representanteOriginal.Status || "",
                Turma: representanteOriginal.Turma || "",
                DATA: representanteOriginal.DATA || "",
                Presenca: representanteData.Presenca || representanteOriginal.Presenca || "",
                Justificativa: representanteData.Justificativa || representanteOriginal.Justificativa || ""
            };

            const dbRef = ref(db, `Historico/Chamada/${fullRepresentanteData.DATA}/${representanteId}`);
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const updatedData = {
                    ...snapshot.val(),
                    ...fullRepresentanteData
                };
                await set(dbRef, updatedData);
            } else {
                await set(dbRef, fullRepresentanteData);
            }
        }

        alert("Alterações salvas com sucesso!");
        setPendingChanges({});
        fetchData();
    };

    return (
        <>
            <Helmet>
                <title>Controle ABS</title>
            </Helmet>
            <Navbar />
            <SideBar />
            <main>
                <div className="container-main">
                    <div className="campo-de-pesquisa">
                        <label htmlFor="NomeTL">Nome:</label>
                        <input type="text" id="NomeTL" value={searchNome} onChange={(e) => setSearchNome(e.target.value)} placeholder="Digite seu nome" />

                        <label htmlFor="RETL">RE:</label>
                        <input type="text" id="RETL" value={searchRE} onChange={(e) => setSearchRE(e.target.value)} placeholder="Digite seu RE" />

                        <label htmlFor="data">Data do relatório:</label>
                        <input type="date" id="data" value={searchData} onChange={(e) => setSearchData(e.target.value)} />

                        <button onClick={handleGenerateReport}>GERAR RELATÓRIO</button>
                        {reportGenerated && !viewOnly && (
                            <button onClick={handleSave}>SALVAR</button>
                        )}
                        {reportGenerated && (
                            <button onClick={handleViewRecords}>VER REGISTROS</button>
                        )}
                    </div>

                    {reportGenerated && (
                        <>
                            <h2>Olá {capitalizeName(searchNome)},&nbsp; Aqui está o relatório <span>ABS</span> da sua equipe!</h2>
                            <div className="container-tabela">
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
                                            <th>Status</th>
                                            <th>Turma</th>
                                            <th>Data</th>
                                            <th>Presença</th>
                                            {!viewOnly && <th>Validação</th>} {/* Exibe somente se não estiver em modo de visualização */}
                                            <th>Justificativa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.ID_Groot}</td>
                                                    <td>{capitalizeName(item.Nome)}</td>
                                                    <td>{item.Matricula}</td>
                                                    <td>{item.Turno}</td>
                                                    <td>{item.Escala_Padrao}</td>
                                                    <td>{item.Cargo_Padrao}</td>
                                                    <td>{item.Area_Padrao}</td>
                                                    <td>{item.Empresa}</td>
                                                    <td>{item.Status}</td>
                                                    <td>{item.Turma}</td>
                                                    <td>{formatDate(item.DATA)}</td>
                                                    <td>{item.Presenca}</td>
                                                    {!viewOnly && (
                                                        <td>
                                                            <select defaultValue={item.Presenca} onChange={(e) => handleStatusChange(item.RepresentanteId, e.target.value)}>
                                                                <option value="">Selecione</option>
                                                                <option value="Presente">Presente</option>
                                                                <option value="Ausente">Ausente</option>
                                                                <option value="Falta Justificada">Falta Justificada</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                    {viewOnly && (
                                                        <td>{item.Justificativa || "Nenhuma justificativa"}
                                                        </td>
                                                    )}
                                                    {!viewOnly && (
                                                        <td>
                                                            <button onClick={() => addJustificativa(item.RepresentanteId)}>
                                                                Adicionar Justificativa
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="13">Nenhum registro encontrado.</td>
                                            </tr>
                                        )}
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

const capitalizeName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default RelatorioEUpdate;
