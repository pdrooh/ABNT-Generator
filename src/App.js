import React, { useState } from 'react';
import { Document, Packer, Paragraph, AlignmentType, TextRun, PageNumber } from 'docx';
import './styles.css';

function App() {
    const [texto, setTexto] = useState('');

    const handleTextChange = (event) => {
        setTexto(event.target.value);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTexto(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = () => {
        const doc = new Document({
            sections: [{
                properties: {
                    margin: {
                        top: 720, // 3 cm
                        right: 570, // 2 cm
                        bottom: 570, // 2 cm
                        left: 720, // 3 cm
                    },
                },
                children: parseTexto(texto),
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'TCC_formatado.docx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    const parseTexto = (texto) => {
        const linhas = texto.split('\n');
        const elementos = [];
        const citaçõesAdicionadas = new Set(); // Para rastrear citações já adicionadas

        linhas.forEach((linha) => {
            linha = linha.trim();

            // Identificar títulos e subtítulos
            if (linha.startsWith('# ')) {
                elementos.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: linha.slice(2),
                            bold: true,
                            color: "000000", // Preto
                            font: "Times New Roman", // Fonte Times New Roman
                            size: 24, // Tamanho 12pt
                        }),
                    ],
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }));
            } else if (linha.startsWith('## ')) {
                elementos.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: linha.slice(3),
                            bold: true,
                            color: "000000", // Preto
                            font: "Times New Roman", // Fonte Times New Roman
                            size: 24, // Tamanho 12pt
                        }),
                    ],
                    heading: 'Heading2',
                    spacing: { after: 200 },
                }));
            } else {
                // Identificar citações longas
                const citaçõesLongas = linha.match(/"([^"]+)"\s*\(([^)]+)\)/);
                if (citaçõesLongas) {
                    const citaçãoCompleta = `${citaçõesLongas[0]}`;
                    if (!citaçõesAdicionadas.has(citaçãoCompleta)) {
                        elementos.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: citaçãoCompleta,
                                    italics: true,
                                    font: "Times New Roman", // Fonte Times New Roman
                                    size: 20, // Tamanho 10pt para citações longas
                                }),
                            ],
                            spacing: { after: 200 }, // 1,0 cm
                            indent: { left: 720 }, // 4 cm de recuo
                            alignment: AlignmentType.JUSTIFY,
                        }));
                        citaçõesAdicionadas.add(citaçãoCompleta); // Adiciona a citação ao conjunto
                    }
                } else {
                    // Identificar citações simples
                    const citaçõesSimples = linha.match(/"([^"]+)"/g);
                    if (citaçõesSimples) {
                        citaçõesSimples.forEach((citação) => {
                            if (!citaçõesAdicionadas.has(citação)) {
                                elementos.push(new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: citação,
                                            italics: true,
                                            font: "Times New Roman", // Fonte Times New Roman
                                            size: 24, // Tamanho 12pt
                                        }),
                                    ],
                                    spacing: { after: 200 }, // 1,0 cm
                                    indent: { left: 720 }, // 1,25 cm
                                    alignment: AlignmentType.JUSTIFY,
                                }));
                                citaçõesAdicionadas.add(citação); // Adiciona a citação ao conjunto
                            }
                        });
                    }

                    // Identificar citações indiretas
                    const citacaoIndireta = linha.match(/([A-Z][a-zA-Z]*),?\s*\d{4}/);
                    if (citacaoIndireta) {
                        const textoSemCitação = linha.replace(citacaoIndireta[0], '').trim();
                        elementos.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${citacaoIndireta[0]} (ano). `,
                                    italics: true,
                                    font: "Times New Roman", // Fonte Times New Roman
                                    size: 24, // Tamanho 12pt
                                }),
                                new TextRun({
                                    text: textoSemCitação,
                                    font: "Times New Roman", // Fonte Times New Roman
                                    size: 24, // Tamanho 12pt
                                }),
                            ],
                            spacing: { after: 200, line: 240 }, // 1,5 cm
                            indent: { left: 720 }, // 1,25 cm
                            alignment: AlignmentType.JUSTIFY,
                        }));
                    } else {
                        // Adiciona o texto normal
                        if (linha) {
                            elementos.push(new Paragraph({
                                text: linha,
                                spacing: { after: 200, line: 240 }, // 1,5 cm
                                indent: { left: 720 }, // 1,25 cm
                                alignment: AlignmentType.JUSTIFY,
                                font: "Times New Roman", // Fonte Times New Roman
                                size: 24, // Tamanho 12pt
                            }));
                        }
                    }
                }
            }
        });

        return elementos;
    };

    return (
        <div className="container">
            <h1>Plataforma de Formatação de Textos</h1>
            <div className="instructions">
                <strong>Instruções:</strong>
                <p>Para identificar títulos e subtítulos, utilize as seguintes marcações:</p>
                <ul>
                    <li><strong>Título:</strong> Inicie a linha com <code># Título</code></li>
                    <li><strong>Subtítulo:</strong> Inicie a linha com <code>## Subtítulo</code></li>
                </ul>
            </div>
            <textarea
                value={texto}
                onChange={handleTextChange}
                placeholder="Cole seu texto aqui..."
            />
            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleSubmit}>Formatar Texto</button>
            <footer>
                <p>&copy; 2024 Pedro H. Rodrigues</p>
            </footer>
        </div>
    );
}

export default App;
