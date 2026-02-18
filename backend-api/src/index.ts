import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import imageRoutes from './routes/images.routes';
import pdfRoutes from './routes/pdf.routes';
import adminRoutes from './routes/admin.routes';
import profileRoutes from './routes/profile.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('🚀 API de Medidor Egea activa y funcionando');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
