#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{process::{Child, Command}, sync::Mutex};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

struct HarnessProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .manage(HarnessProcess(Mutex::new(None)))
        .setup(|app| {
            let runtime = app.path().resource_dir()?.join("runtime-bundle");
            let node_name = if cfg!(windows) { "node.exe" } else { "node" };
            let child = Command::new(runtime.join(node_name))
                .arg(runtime.join("launcher.cjs")).current_dir(&runtime).spawn()?;
            *app.state::<HarnessProcess>().0.lock().unwrap() = Some(child);
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("DeepSeek Harness").inner_size(1440.0, 900.0)
                .min_inner_size(960.0, 640.0).build()?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Some(process) = window.app_handle().try_state::<HarnessProcess>() {
                    if let Some(mut child) = process.0.lock().unwrap().take() { let _ = child.kill(); }
                }
            }
        })
        .run(tauri::generate_context!()).expect("error while running DeepSeek Harness");
}
