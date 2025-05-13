import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/styles/buttons-light.css'
import './lib/styles/sidebar-light.css'
import './lib/styles/sidebar-dark.css'
import './lib/styles/dashboard-dark.css'
import './lib/styles/buttons-dark.css'
import './lib/styles/forms-dark.css'

createRoot(document.getElementById("root")!).render(<App />);
