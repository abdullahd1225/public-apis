import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { classroomsApi } from '../api/client.js';

/** Kullanıcının erişebildiği sınıfları listeler. İlk sınıfı otomatik seçebilir. */
export default function ClassroomSelect({ value, onChange, autoSelect, allowClear, style, onLoaded }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    classroomsApi.list().then((l) => {
      setList(l);
      onLoaded?.(l);
      if (autoSelect && !value && l[0]) onChange?.(l[0]._id);
    });
  }, []);
  return (
    <Select
      placeholder="Sınıf seçin"
      value={value}
      onChange={onChange}
      allowClear={allowClear}
      style={{ minWidth: 180, ...style }}
      options={list.map((c) => ({ value: c._id, label: `${c.name} (${c.academicYear})` }))}
    />
  );
}
