# DeepSeek Harness Desktop

> 一个面向 Windows 的轻量桌面封装，让用户无需手动安装 Node.js，即可运行 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI。

## 中文

### 项目定位

本项目使用 **Tauri 2 + Windows WebView2** 打包 DeepSeek Harness：桌面窗口复用系统 WebView2，后台携带独立 Node.js runtime 启动 `@deepseek-ai/dsh web`。因此安装包比 Electron 方案更轻，用户也不需要预装 Node.js。

这是一个**非官方项目**，与 DeepSeek AI 没有隶属、背书或商业合作关系；它只负责降低原项目的 Windows 安装成本，核心功能与版本来自上游项目。

### 下载与使用

在 GitHub Actions 的 Artifacts 或 Releases 下载 Windows 安装包，运行安装器即可。Windows 10/11 通常已经安装 WebView2；若系统缺少，安装器会引导下载 WebView2 runtime。

### 本地构建

环境：Windows 10/11、Rust stable、Visual Studio C++ Build Tools、Node.js 22+、pnpm 11。

```powershell
pnpm install --registry=https://registry.npmmirror.com
pnpm build
```

安装包输出到 `src-tauri/target/release/bundle/nsis/`。

### 上游版本对齐

`package.json` 固定上游 `@deepseek-ai/dsh` 版本；`pnpm-lock.yaml` 锁定完整依赖树。CI 会检查当前版本是否等于 npm 最新发布版本，避免桌面包悄悄落后于源仓库。

## English

### What it is

This project packages the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI as a lightweight Windows desktop app. It uses **Tauri 2 and the system WebView2 runtime**, while bundling an isolated Node.js runtime so end users do not need to install Node.js manually.

This is an **unofficial community wrapper**. It is not affiliated with, endorsed by, or sponsored by DeepSeek AI. The wrapper only reduces Windows installation friction; the actual application and release version come from the upstream project.

### Install and run

Download the installer from GitHub Actions Artifacts or Releases and run it. Windows 10/11 normally includes WebView2; the installer can bootstrap WebView2 when it is missing.

### Build locally

Requirements: Windows 10/11, stable Rust, Visual Studio C++ Build Tools, Node.js 22+, and pnpm 11.

```powershell
pnpm install --registry=https://registry.npmmirror.com
pnpm build
```

The NSIS installer is generated under `src-tauri/target/release/bundle/nsis/`.

### Version alignment

The upstream `@deepseek-ai/dsh` version is pinned in `package.json`, with the full dependency tree locked in `pnpm-lock.yaml`. CI checks that the pinned package matches the latest npm release so desktop builds do not silently lag behind upstream.

## License

The wrapper code is MIT licensed. DeepSeek Harness and its third-party dependencies remain subject to their respective upstream licenses; see the upstream repository for details.
