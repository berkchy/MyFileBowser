const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware'ler
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dosya listesi API endpoint'i
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        return res.json([]);
    }

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
                    path: `/uploads/${encodeURIComponent(file)}`
                };
            } catch (error) {
                console.error(`Dosya bilgisi alınamadı: ${file}`, error);
                return null;
            }
        }).filter(file => file !== null);

        res.json(fileList);
    });
});

// Dosya indirme endpoint'i (Vercel için özel)
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, req.params.filename, {
            headers: {
                'Content-Disposition': `attachment; filename="${req.params.filename}"`
            }
        });
    } else {
        res.status(404).send('Dosya bulunamadı');
    }
});

// Dosya boyutu formatlama
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});