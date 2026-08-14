# DeepSeek Harness Desktop 发布维护指令

## 上游版本与 Tag

- 上游仓库是 `deepseek-ai/deepseek-harness`，dsh 发布 Tag 格式为 `dsh-v<semver>`。
- `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 和锁文件中的应用版本必须与 Tag 去掉 `dsh-v` 后的版本一致。
- 定期运行 `.github/workflows/sync-upstream.yml`。它读取上游最新 `dsh-v*` Tag，更新 `@deepseek-ai/dsh`，提交版本同步变更并推送同名 Tag。
- 上游没有公开 Tag 时不得伪造“已同步”的上游 Tag；只有人工明确指定版本时才允许手动触发该版本发版。

## 三平台发布

- `dsh-v*` Tag 触发 `.github/workflows/release.yml`，必须同时构建 Windows、macOS 和 Linux GUI 安装包（NSIS、DMG、DEB），并将全部产物上传到本仓库同一个 GitHub Release。
- 运行时使用构建 runner 的原生 Node，不下载无关平台二进制；安装包使用 NSIS 的 LZMA 最高压缩模式，并删除 npm 缓存与开发依赖。
- 发布前运行 `pnpm install --frozen-lockfile`、版本校验和 Rust/Tauri 构建验证。

## 依赖与 Actions

- Actions 使用当前维护中的 major 版本，禁止新增 deprecated action、Node 运行时或已弃用参数。
- 依赖升级必须同步更新 `pnpm-lock.yaml` 和 `src-tauri/Cargo.lock`，并在提交前检查工作区无生成物误入版本控制。
