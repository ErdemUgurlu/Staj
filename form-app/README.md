# Form Management System

Bu proje, dinamik form yönetimi yapan bir web uygulamasıdır. React frontend ve Spring Boot backend kullanılarak geliştirilmiştir.

## Özellikler

- İki farklı form tipi (5 ve 3 parametreli)
- Form verilerinin backend'de saklanması
- Form verilerinin byte array'e dönüştürülmesi (TCP için hazırlık)
- Gönderilen formların listelenmesi
- Form silme işlemi
- Responsive tasarım

## Teknolojiler

### Frontend
- React
- CSS3
- Modern JavaScript (ES6+)

### Backend
- Spring Boot
- Java
- Maven

## Kurulum

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend varsayılan olarak http://localhost:8080 adresinde çalışacaktır.

## API Endpoints

- `POST /api/forms/type1`: Form Tip 1 gönderimi
- `POST /api/forms/type2`: Form Tip 2 gönderimi
- `GET /api/forms`: Tüm formları listele
- `GET /api/forms/{id}`: ID'ye göre form getir
- `DELETE /api/forms/{id}`: Form sil
- `GET /api/forms/type/{formType}`: Form tipine göre listele

## Geliştirici

Bu proje staj kapsamında geliştirilmiştir. 