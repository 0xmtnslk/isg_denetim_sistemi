export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Hoşgeldiniz</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Toplam Denetim</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Tamamlanan</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Ortalama Skor</h3>
          <p className="text-3xl font-bold text-orange-600">0%</p>
        </div>
      </div>
    </div>
  );
}
