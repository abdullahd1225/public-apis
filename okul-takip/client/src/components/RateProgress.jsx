import { Progress } from 'antd';

export const rateColor = (r) => (r == null ? '#bbb' : r >= 80 ? '#22a06b' : r >= 50 ? '#f5a524' : '#e5484d');

export default function RateProgress({ rate, size = 'small', type = 'line' }) {
  if (rate == null) return <span style={{ color: '#999' }}>—</span>;
  return <Progress percent={rate} size={size} type={type} strokeColor={rateColor(rate)} />;
}
