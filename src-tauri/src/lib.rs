use tauri_plugin_shell::ShellExt;
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // https://github.com/tauri-apps/tauri/discussions/3273#discussioncomment-10912617
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let sidecar_command = app.shell().sidecar("backend").unwrap();
            let (mut _rx, sidecar_child) = sidecar_command
            // .args(["-example","example"])
            .spawn()
            .expect("Failed to spawn sidecar");

            // Wrap the child process in Arc<Mutex<>> for shared access
            let child = Arc::new(Mutex::new(Some(sidecar_child)));

            // Clone the Arc to move into the async task
            let child_clone = Arc::clone(&child);

            let window = app.get_webview_window("main").unwrap();

            window.on_window_event( move |event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {

                let mut child_lock = child_clone.lock().unwrap();
                if let Some(mut child_process) = child_lock.take() {
                if let Err(e) = child_process.write("Exit message from Rust\n".as_bytes())
                {
                    println!("Fail to send to stdin of child process: {}", e);
                }

                if let Err(e) = child_process.kill() {
                    eprintln!("Failed to kill child process: {}", e);
                }
                }
            }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
