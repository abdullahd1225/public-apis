export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const notFound = (what = 'Kayıt') => new HttpError(404, `${what} bulunamadı`);
export const forbidden = () => new HttpError(403, 'Bu kayda erişim yetkiniz yok');
