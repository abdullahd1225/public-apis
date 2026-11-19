import { Tooltip, Empty } from 'antd';
import dayjs from 'dayjs';

/** Bağımlılıksız, hafif haftalık yığılmış çubuk grafik (işlendi / planlandı / iptal) */
export default function MiniBarChart({ data = [] }) {
  if (!data.length) return <Empty description="Henüz ders kaydı yok" />;
  const max = Math.max(...data.map((d) => d.done + d.planned + d.cancelled), 1);
  const seg = (v, color) => v > 0 && <div style={{ height: `${(v / max) * 100}%`, background: color }} />;
  return (
    <div className="mini-bars">
      {data.map((d) => (
        <Tooltip key={d.weekStart} title={`${dayjs(d.weekStart).format('DD MMM')} haftası — İşlendi: ${d.done}, Planlı: ${d.planned}, İptal: ${d.cancelled}`}>
          <div className="col">
            <div className="stack">
              {seg(d.done, '#22a06b')}
              {seg(d.planned, '#8f73ff')}
              {seg(d.cancelled, '#e5484d')}
            </div>
            <span className="lbl">{dayjs(d.weekStart).format('DD.MM')}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
