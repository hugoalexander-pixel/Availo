import app from './app';

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
  console.log(`KelasKosong API berjalan di http://localhost:${PORT}`);
});
