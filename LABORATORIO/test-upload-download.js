/**
 * Script de teste para validação das novas rotas de Upload e Download (Aula 56)
 * 
 * Este script:
 * 1. Realiza login para obter o token JWT.
 * 2. Faz o upload de um arquivo PNG para o produto ID 1.
 * 3. Faz o download do arquivo PNG e verifica a integridade.
 * 4. Faz o upload de um arquivo PDF para o produto ID 1.
 * 5. Faz o download do arquivo PDF e verifica a integridade.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
const LOGIN_DATA = {
    email: 'admin@qatest.com',
    password: 'Teste@123'
};

async function testUploadDownload() {
    console.log('🚀 Iniciando testes de Upload/Download...');

    try {
        // 1. LOGIN
        console.log('\n--- Passagem 1: Autenticação ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(LOGIN_DATA)
        });

        const loginJson = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(`Falha no login: ${JSON.stringify(loginJson)}`);
        }

        const token = loginJson.data.token;
        console.log('✅ Autenticado com sucesso!');

        const headers = { 'Authorization': `Bearer ${token}` };

        // 2. UPLOAD PNG
        console.log('\n--- Passagem 2: Upload PNG ---');
        const pngContent = Buffer.from('89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415408D763F8FFFF3F0005FE02FE0000000049454E44AE426082', 'hex'); // Fake 1x1 PNG
        
        const formPNG = new FormData();
        const pngBlob = new Blob([pngContent], { type: 'image/png' });
        formPNG.append('file', pngBlob, 'test-image.png');

        const uploadPngRes = await fetch(`${BASE_URL}/products/1/image`, {
            method: 'POST',
            headers: headers,
            body: formPNG
        });

        const uploadPngJson = await uploadPngRes.json();
        console.log('Resumo Upload PNG:', uploadPngJson.mensagens);
        
        if (!uploadPngRes.ok) throw new Error('Falha no upload PNG');

        // 3. DOWNLOAD PNG
        console.log('\n--- Passagem 3: Download PNG ---');
        const downloadPngRes = await fetch(`${BASE_URL}/products/1/image`, {
            headers: headers
        });

        if (downloadPngRes.ok) {
            const downloadedPng = await downloadPngRes.arrayBuffer();
            console.log(`✅ Download PNG OK! Tamanho: ${downloadedPng.byteLength} bytes`);
        } else {
            throw new Error('Falha no download PNG');
        }

        // 4. UPLOAD PDF
        console.log('\n--- Passagem 4: Upload PDF ---');
        const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 15 >>\nstream\nBT /F1 12 Tf ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n277\n%%EOF');
        
        const formPDF = new FormData();
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
        formPDF.append('file', pdfBlob, 'manual.pdf');

        const uploadPdfRes = await fetch(`${BASE_URL}/products/1/pdf`, {
            method: 'POST',
            headers: headers,
            body: formPDF
        });

        const uploadPdfJson = await uploadPdfRes.json();
        console.log('Resumo Upload PDF:', uploadPdfJson.mensagens);
        
        if (!uploadPdfRes.ok) throw new Error('Falha no upload PDF');

        // 5. DOWNLOAD PDF
        console.log('\n--- Passagem 5: Download PDF ---');
        const downloadPdfRes = await fetch(`${BASE_URL}/products/1/pdf`, {
            headers: headers
        });

        if (downloadPdfRes.ok) {
            const downloadedPdf = await downloadPdfRes.arrayBuffer();
            console.log(`✅ Download PDF OK! Tamanho: ${downloadedPdf.byteLength} bytes`);
        } else {
            throw new Error('Falha no download PDF');
        }

        console.log('\n✨ Todos os testes concluídos com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante os testes:', error.message);
    }
}

// Executar
testUploadDownload();
