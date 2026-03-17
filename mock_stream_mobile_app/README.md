# Flutter WebView App for Mock Stream

This is the source code for your Mock Stream WebView mobile application to run `https://bekzods-multilevel.netlify.app/`.

## Steps to Build and Run the App

Since you do not currently have Flutter installed on your PC, please follow these steps:

### 1. Install Flutter
1. Go to [flutter.dev](https://flutter.dev/docs/get-started/install) and download the Flutter SDK for Windows.
2. Extract the zip file and add the `flutter/bin` folder to your system PATH.
3. Install **Android Studio** (this provides the Android SDK and emulators so you can test and build the app for Android devices).

### 2. Generate Platform Folders
Because this folder currently only contains the Dart code (`lib/main.dart`) and the package config (`pubspec.yaml`), you need Flutter to generate the specific files for Android and iOS.

Open a terminal or command prompt inside this folder (`mock_stream_mobile_app`) and run:
```bash
flutter create .
```
*(Don't forget the dot `.` at the end, it tells Flutter to create the project in the current directory).*

### 3. Add Internet Permission (For Android)
For the WebView to load an external URL on an Android device, the app must have internet permissions.
After you run `flutter create .`, open the generated file `android/app/src/main/AndroidManifest.xml` and add this line inside the `<manifest>` tag (above the `<application>` tag):
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

### 4. Adjust SDK Version (If needed)
The `webview_flutter` package usually requires a minimum Android SDK version. If the app fails to build, open `android/app/build.gradle` and change `minSdkVersion` to `19` (or higher).

### 5. Run the App!
If you have an Android device plugged in (with USB Debugging enabled) or an Android Emulator running, you can now install and launch the app:
```bash
flutter run
```

---

### What this code does:
- The app launches and fills the screen.
- It uses the `webview_flutter` package to securely embed a browser within the app.
- It points directly to `https://bekzods-multilevel.netlify.app/` so users see the exact same web app, but seamlessly enclosed in a mobile experience.
