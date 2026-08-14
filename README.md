# DeepSeek Harness Desktop

> 一个面向 Windows、macOS 和 Linux 的轻量桌面封装，让用户无需手动安装 Node.js，即可运行 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI。

## 中文

### 项目定位

本项目使用 **Tauri 2** 打包 DeepSeek Harness：桌面窗口复用 Windows WebView2、macOS WKWebView 和 Linux WebKitGTK，后台携带当前构建平台的独立 Node.js runtime 启动 `@deepseek-ai/dsh web`。因此安装包比 Electron 方案更轻，用户也不需要预装 Node.js。

这是一个**非官方项目**，与 DeepSeek AI 没有隶属、背书或商业合作关系；它只负责降低原项目的 Windows 安装成本，核心功能与版本来自上游项目。

### 下载与使用

在 GitHub Releases 下载对应平台安装包即可。Windows 10/11 通常已经安装 WebView2；若系统缺少，安装器会引导下载 WebView2 runtime。每个上游 dsh release 会生成 Windows、macOS 和 Linux 三个平台的 GUI 产物。

### 本地构建

环境：对应平台的 Tauri 2 编译依赖、Rust stable、Node.js 22+、pnpm 11。Linux 还需要 WebKitGTK、AppIndicator、librsvg 和 patchelf 开发包。

```powershell
pnpm install --registry=https://registry.npmmirror.com
pnpm build
```

安装包输出到 `src-tauri/target/release/bundle/nsis/`。

### 上游版本对齐

上游的 dsh 标签格式为 `dsh-v<semver>`。同步工作流会读取上游最新标签，同时更新 `package.json`、Tauri、Cargo 和锁文件，并推送同名标签；标签触发三平台构建，产物集中发布到本仓库 Release。没有上游标签时不会伪造同步标签，人工指定版本可通过 workflow dispatch 发版。

## English

### What it is

This project packages the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI as a lightweight Windows, macOS, and Linux desktop app. It uses **Tauri 2 and each platform's system webview**, while bundling an isolated Node.js runtime so end users do not need to install Node.js manually.

This is an **unofficial community wrapper**. It is not affiliated with, endorsed by, or sponsored by DeepSeek AI. The wrapper only reduces Windows installation friction; the actual application and release version come from the upstream project.

### Install and run

Download the installer for your platform from GitHub Releases and run it. Windows 10/11 normally includes WebView2; the installer can bootstrap WebView2 when it is missing.

### Build locally

Requirements: platform Tauri dependencies, stable Rust, Node.js 22+, and pnpm 11. Linux also needs WebKitGTK, AppIndicator, librsvg, and patchelf development packages.

```powershell
pnpm install --registry=https://registry.npmmirror.com
pnpm build
```

Platform installers are generated under `src-tauri/target/release/bundle/`.

### Version alignment

Upstream dsh tags use `dsh-v<semver>`. The sync workflow updates all manifests and lockfiles, pushes the same tag here, and the tag workflow builds and publishes Windows, macOS, and Linux installers to one Release.

## License

The wrapper code is MIT licensed. DeepSeek Harness and its third-party dependencies remain subject to their respective upstream licenses; see the upstream repository for details.
