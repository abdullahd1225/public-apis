// Tema ayarları tek yerde: renkler/kurumsal kimlik buradan değiştirilir
export const theme = {
  token: {
    colorPrimary: '#6d4aff',
    colorInfo: '#6d4aff',
    colorSuccess: '#22a06b',
    colorWarning: '#f5a524',
    colorError: '#e5484d',
    borderRadius: 10,
    fontFamily: "'Nunito', -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: { siderBg: '#1f1640', headerBg: '#ffffff', bodyBg: '#f6f4fd' },
    Menu: { darkItemBg: '#1f1640', darkItemSelectedBg: '#6d4aff', darkSubMenuItemBg: '#1a1236' },
    Card: { headerFontSize: 16 },
  },
};

export const STATUS = {
  done: { text: 'Yaptı', color: 'green' },
  partial: { text: 'Eksik', color: 'gold' },
  not_done: { text: 'Yapmadı', color: 'red' },
  null: { text: 'Kontrol edilmedi', color: 'default' },
};
export const LESSON_STATUS = {
  planned: { text: 'Planlandı', color: 'blue' },
  done: { text: 'İşlendi', color: 'green' },
  cancelled: { text: 'İptal', color: 'red' },
};
