import React, { useState } from 'react';
import { Document, Packer, Paragraph, AlignmentType, TextRun } from 'docx';
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
                        top: 720, // 3 cm em twips
                        right: 570, // 2 cm em twips
                        bottom: 570, // 2 cm em twips
                        left: 720, // 3 cm em twips
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

        linhas.forEach((linha) => {
            linha = linha.trim(); // Remove espaços em branco no início e no final

            if (linha.startsWith('# ')) {
                elementos.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: linha.slice(2),
                            bold: true,
                            color: "000000", // Cor preta
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
                            color: "000000", // Cor preta
                        }),
                    ],
                    heading: 'Heading2',
                    spacing: { after: 200 },
                }));
            } else if (linha) { // Adiciona apenas se a linha não estiver vazia
                elementos.push(new Paragraph({
                    text: linha,
                    spacing: { after: 200 },
                    indent: { left: 720 }, // 1,25 cm de recuo
                    alignment: AlignmentType.JUSTIFY,
                }));
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
                    <li><strong>Título:</strong> Inicie a linha com <code># Título</code> (por exemplo, <code># Introdução</code>)</li>
                    <li><strong>Subtítulo:</strong> Inicie a linha com <code>## Subtítulo</code> (por exemplo, <code>## Objetivos</code>)</li>
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
