// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware'ler
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ana sayfa route'u - index.html'i gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dosya listesini döndüren endpoint
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Klasör okuma hatası:', err);
            return res.status(500).json({ error: 'Klasör okunamadı' });
        }

        const fileList = files.map(file => {
            try {
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);
                
                return {
                    name: file,
                    date: stats.mtime.toLocaleString(),
                    size: formatFileSize(stats.size),
                    path: `/uploads/${file}` // İndirme linki
                };
            } catch (error) {
                console.error(`Dosya bilgisi alınamadı: ${file}`, error);
                return null;
            }
        }).filter(file => file !== null);

        res.json(fileList);
    });
});

// Dosya boyutunu okunabilir formata çevirme
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 404 Hatası
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Hata yönetimi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Bir hata oluştu!');
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
