# Hướng dẫn Setup PDF Viewer với Expo Dev Client

## ✅ Điều kiện bắt buộc

- ❌ **KHÔNG** dùng Expo Go
- ✅ Dùng **Expo Dev Client** hoặc **Bare workflow**
- ✅ Có native code (sau khi prebuild)

## 📦 Các bước setup

### 1. Prebuild để generate native code

```bash
cd my-app
npx expo prebuild
```

Lệnh này sẽ tạo thư mục `android/` và `ios/` với native code.

### 2. Build và chạy app

#### Android:
```bash
npx expo run:android
```

#### iOS:
```bash
npx expo run:ios
```

### 3. Kiểm tra dependencies

Đảm bảo đã cài đặt:
- ✅ `react-native-pdf` (đã có trong package.json)
- ✅ `react-native-blob-util` (đã cài)

### 4. Chạy Metro bundler

Sau khi build xong, chạy:
```bash
npm start
```

Sau đó mở app trên thiết bị/emulator.

## 🔧 Troubleshooting

### Lỗi "Cannot read property 'getConstants' of null"

**Nguyên nhân**: Native modules chưa được link.

**Giải pháp**:
1. Xóa thư mục `android/` và `ios/` (nếu có)
2. Chạy lại `npx expo prebuild --clean`
3. Build lại app

### Lỗi khi build Android

Nếu gặp lỗi Gradle:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Lỗi khi build iOS

Nếu gặp lỗi CocoaPods:
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

## 📝 Lưu ý

- Sau khi prebuild, **KHÔNG** dùng Expo Go nữa
- Phải build app mới mỗi khi thay đổi native dependencies
- Code đã được cập nhật để tự động detect và dùng `react-native-pdf` cho PDF
- HTML certificates vẫn dùng WebView (hoạt động tốt)

## ✅ Kết quả

Sau khi setup xong:
- PDF sẽ hiển thị trong app bằng `react-native-pdf`
- Không còn lỗi ERR_ACCESS_DENIED
- PDF viewer có đầy đủ tính năng (zoom, scroll, etc.)

