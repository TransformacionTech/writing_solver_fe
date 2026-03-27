export interface MockUser {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  icon: string;
}

// >>> MODIFICA ESTOS USUARIOS SEGUN TU APP <<<
export const MOCK_USERS: MockUser[] = [
  { id: 'usr-001', name: 'Admin User',   email: 'admin@app.com',   roleLabel: 'Administrador', icon: 'admin_panel_settings' },
  { id: 'usr-002', name: 'Normal User',  email: 'user@app.com',    roleLabel: 'Usuario',       icon: 'person' },
  { id: 'usr-003', name: 'Viewer User',  email: 'viewer@app.com',  roleLabel: 'Lector',        icon: 'visibility' },
];
