# Firebase 云端同步配置

代码已经支持 Firebase 云端同步。`firebase-config.js` 填好后，日程会保存到你的用户数据下，整站内容会保存到公共网站内容文档中。

## 1. 创建 Firebase 项目

1. 打开 <https://console.firebase.google.com/>
2. 点击 Add project / 添加项目
3. 项目名可以填 `hdl4xl-lab`
4. Google Analytics 可以先关闭

## 2. 添加 Web App

1. 进入项目后，点击 Web 图标 `</>`
2. App nickname 可以填 `hdl4xl-site`
3. 不需要勾选 Firebase Hosting
4. 复制 Firebase config
5. 把 `firebase-config.js` 中的空字符串替换成你的配置

## 3. 开启登录

1. 左侧进入 Authentication
2. Get started
3. Sign-in method
4. 启用 Google
5. Authorized domains 中确保有 `hdl4xl.github.io`

## 4. 开启 Firestore

1. 左侧进入 Firestore Database
2. Create database
3. 选择 Production mode
4. 区域选择默认或离你较近的区域

## 5. 配置安全规则

第一次登录网站后，页面会显示你的 UID。把下面规则里的 `PASTE_YOUR_UID_HERE` 换成你的 UID：

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /siteContent/{documentId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == "PASTE_YOUR_UID_HERE";
    }

    match /users/{userId}/schedules/{dateId} {
      allow read, write: if request.auth != null
        && request.auth.uid == "PASTE_YOUR_UID_HERE"
        && userId == "PASTE_YOUR_UID_HERE";
    }
  }
}
```

这样所有访问者都能看到你发布的整站内容，只有你的 Google 账号能更新整站内容和读写日程。
