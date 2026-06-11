// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::TcpListener;
use std::sync::Mutex;
use tauri::State;
use tauri_plugin_shell::ShellExt;

struct SidecarPort(Mutex<u16>);

#[tauri::command]
fn get_sidecar_port(port_state: State<'_, SidecarPort>) -> u16 {
    *port_state.0.lock().unwrap()
}

fn get_available_port() -> u16 {
    let blacklist = [3000, 4200, 5000, 5432, 8000, 8080, 3306, 27017];
    loop {
        // bind to port 0 lets OS choose a free port
        if let Ok(listener) = TcpListener::bind("127.0.0.1:0") {
            if let Ok(addr) = listener.local_addr() {
                let port = addr.port();
                if !blacklist.contains(&port) {
                    return port;
                }
            }
        }
    }
}

fn main() {
    let port = get_available_port();
    
    tauri::Builder::default()
        .manage(SidecarPort(Mutex::new(port)))
        .invoke_handler(tauri::generate_handler![get_sidecar_port])
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            match app.shell().sidecar("cdcart-backend") {
                Ok(command) => {
                    // Pasar el puerto dinámico al backend en Python
                    let command = command.arg("--port").arg(port.to_string());
                    match command.spawn() {
                        Ok((_rx, _child)) => {
                            println!("Sidecar iniciado correctamente en el puerto {}.", port);
                        }
                        Err(e) => {
                            eprintln!("Fallo al spawnear el sidecar: {}", e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Fallo al crear el comando del sidecar: {}", e);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
