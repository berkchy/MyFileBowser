// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Dosya listesini döndüren endpoint
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads'); // 'uploads' klasörünü oku
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Klasör okunamadı' });
        }

        const fileList = files.map(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            
            return {
                name: file,
                date: stats.mtime.toLocaleString(), // Son değiştirilme tarihi
                size: formatFileSize(stats.size), // Boyut
                path: `/download/${file}` // İndirme linki
            };
        });

        res.json(fileList);
    });
});

// Dosya indirme endpoint'i
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

// Dosya boyutunu okunabilir formata çevirme
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Statik dosyaları sun
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});