const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// HTML dosyasını sunmak için özel route
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('HTML dosyası bulunamadı. public/index.html konumunu kontrol edin.');
    }
});

// Statik dosyalar
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API endpoint'i
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(directoryPath)) {
        return res.json([]);
    }

    fs.readdir(directoryPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Klasör okunamadı' });
        
        const fileList = files.map(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            
            return {
                name: file,
                date: stats.mtime.toLocaleString(),
                size: formatFileSize(stats.size),
                path: `/uploads/${encodeURIComponent(file)}`
            };
        });
        
        res.json(fileList);
    });
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
    console.log(`HTML dosya yolu: ${path.join(__dirname, 'public', 'index.html')}`);
});