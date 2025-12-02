# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## iOS Development trên Windows

Vì Windows không thể chạy iOS Simulator trực tiếp, có các cách sau:

### Cách 1: Dùng Expo Go (Đơn giản nhất - Khuyến nghị cho testing nhanh)

1. Cài Expo Go trên iPhone từ App Store
2. **Nếu gặp lỗi "Could not connect to development server"**, dùng tunnel mode:
   ```bash
   npm run start:ios
   # hoặc
   npm run start:tunnel
   ```
3. Quét QR code bằng Camera app (iOS) hoặc Expo Go app
4. App sẽ chạy trên thiết bị thật

**Lưu ý**: Expo Go có một số giới hạn với native modules phức tạp.

#### 🔧 Troubleshooting: "Could not connect to development server"

Nếu gặp lỗi này, thử các cách sau:

**Giải pháp 1: Dùng Tunnel Mode (Khuyến nghị)**

```bash
npm run start:ios
# hoặc
npm run start:tunnel
```

Tunnel mode sử dụng ngrok để tạo kết nối qua internet, không cần cùng WiFi.

**Giải pháp 2: Kiểm tra Network**

- Đảm bảo iPhone và máy tính **cùng WiFi**
- Tắt VPN trên cả hai thiết bị
- Kiểm tra firewall Windows có chặn port 8081 không

**Giải pháp 3: Dùng LAN Mode**

```bash
npm run start:lan
```

Sau đó thử lại trên iPhone.

**Giải pháp 4: Kiểm tra Firewall**

- Mở Windows Defender Firewall
- Cho phép Node.js qua firewall
- Hoặc tạm thời tắt firewall để test

**Giải pháp 5: Manual Connection**

- Trong Expo Go, nhấn "Enter URL manually"
- Nhập: `exp://[IP-ADDRESS]:8081` (thay [IP-ADDRESS] bằng IP máy tính)
- Hoặc dùng URL từ terminal output

### Cách 2: Development Build (Cho tính năng đầy đủ)

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Build development client:

   - **Trên macOS**:
     ```bash
     npm run prebuild
     npx expo run:ios
     ```
   - **Trên Windows (dùng EAS Build)**:

     ```bash
     # Cài EAS CLI
     npm install -g eas-cli

     # Đăng nhập
     eas login

     # Build development client cho iOS
     eas build --profile development --platform ios
     ```

3. Sau khi có development build, chạy:
   ```bash
   npm run start:dev
   ```

### Cách 3: Dùng máy macOS hoặc Cloud Build

Nếu có quyền truy cập macOS:

```bash
npm run prebuild
npx expo run:ios
```

Hoặc dùng EAS Build để build trên cloud:

```bash
eas build --platform ios --profile development
```

### Scripts có sẵn

- `npm start` - Khởi động Expo với Expo Go (LAN mode)
- `npm run start:ios` - Khởi động với **tunnel mode** (tốt nhất cho iOS trên Windows)
- `npm run start:tunnel` - Khởi động với tunnel mode (qua ngrok)
- `npm run start:lan` - Khởi động với LAN mode (cần cùng WiFi)
- `npm run start:dev` - Khởi động với development client
- `npm run ios:dev` - Khởi động iOS với development client (cần macOS)
- `npm run prebuild` - Tạo native iOS/Android projects
- `npm run prebuild:clean` - Tạo lại native projects từ đầu

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
