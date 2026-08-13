#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{net::TcpStream, process::{Child, Command}, sync::Mutex, thread, time::Duration};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

struct HarnessProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .manage(HarnessProcess(Mutex::new(None)))
        .setup(|app| {
            let runtime = app.path().resource_dir()?.join("runtime-bundle");
            let child = Command::new(runtime.join("node.exe"))
                .arg(runtime.join("launcher.cjs")).current_dir(&runtime).spawn()?;
            *app.state::<HarnessProcess>().0.lock().unwrap() = Some(child);
            for _ in 0..120 {
                if TcpStream::connect("127.0.0.1:3080").is_ok() { break; }
                thread::sleep(Duration::from_millis(500));
            }
            WebviewWindowBuilder::new(app, "main", WebviewUrl::External("http://127.0.0.1:3080".parse().unwrap()))
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
