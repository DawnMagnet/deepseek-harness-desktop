#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::{self, OpenOptions},
    net::TcpListener,
    process::{Child, Command, Stdio},
    sync::Mutex,
};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

struct HarnessProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .manage(HarnessProcess(Mutex::new(None)))
        .setup(|app| {
            let runtime = app.path().resource_dir()?.join("runtime-bundle");
            let node_name = if cfg!(windows) { "node.exe" } else { "node" };
            let listener = TcpListener::bind(("127.0.0.1", 0))?;
            let port = listener.local_addr()?.port();
            drop(listener);

            let log_dir = app.path().app_log_dir()?;
            fs::create_dir_all(&log_dir)?;
            let log = OpenOptions::new()
                .create(true)
                .truncate(true)
                .write(true)
                .open(log_dir.join("backend.log"))?;
            let child = Command::new(runtime.join(node_name))
                .arg(runtime.join("node_modules/@deepseek-ai/dsh/lib/bin.js"))
                .args(["web", "--port", &port.to_string()])
                .current_dir(&runtime)
                .stdout(Stdio::from(log.try_clone()?))
                .stderr(Stdio::from(log))
                .spawn()?;
            *app.state::<HarnessProcess>().0.lock().unwrap() = Some(child);
            WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::App(format!("index.html?port={port}").into()),
            )
            .title("DeepSeek Harness")
            .inner_size(1440.0, 900.0)
            .min_inner_size(960.0, 640.0)
            .build()?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Some(process) = window.app_handle().try_state::<HarnessProcess>() {
                    if let Some(mut child) = process.0.lock().unwrap().take() {
                        let _ = child.kill();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running DeepSeek Harness");
}
