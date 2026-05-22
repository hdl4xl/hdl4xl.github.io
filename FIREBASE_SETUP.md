# Firebase 云端同步配置

代码已经支持 Firebase 公共云端同步。`firebase-config.js` 填好后，整站内容会保存到 `siteContent/main`，日程会保存到 `publicSchedules`，所有访问者都可以读取和修改。

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

## 3. 公共同步模式

当前网站不需要登录。任何访问者都可以修改内容，并且其他访问者刷新云端后能看到同一份内容。

注意：这也意味着任何人都可以误删、乱改或覆盖内容。这个模式适合公开协作或临时共享，不适合保存不能被他人修改的重要内容。

## 4. 开启 Firestore

1. 左侧进入 Firestore Database
2. Create database
3. 选择 Production mode
4. 区域选择默认或离你较近的区域

## 5. 配置安全规则

公共协作模式需要允许匿名读写这两个位置：

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /siteContent/{documentId} {
      allow read, write: if true;
    }

    match /publicSchedules/{dateId} {
      allow read, write: if true;
    }
  }
}
```

这样所有访问者都能看到并修改整站内容和日程。
