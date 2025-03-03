const path = require("path");

const dlp_path = {
    'dlp.windows.x64.v-1.0.0.exe': path.join(process.cwd(), 'uploads', 'products/dlp/windows/v-1.0.0/dlp.window.exe'),
    'dlp.linux.x64.v-1.0.0.deb': path.join(process.cwd(), 'uploads', 'products/dlp/linux/v-1.0.0/dlp.linux.deb'),
    'waf.windows.x64.v-1.0.0.exe': path.join(process.cwd(), 'uploads', 'products/waf/windows/v-1.0.0/waf.window.exe'),
    'waf.linux.x64.v-1.0.0.deb': path.join(process.cwd(), 'uploads', 'products/waf/linux/v-1.0.0/waf.linux.deb'),
    'waf.linux.x64.v-1.0.0.deb': path.join(process.cwd(), 'uploads', 'products/waf/linux/v-1.0.0/waf.linux.deb'),
    'waf.windows.x64.v-1.0.0.exe': path.join(process.cwd(), 'uploads', 'products/waf/windows/v-1.0.0/waf.window.exe'),
    'waf.linux.x64.v-1.0.0.deb': path.join(process.cwd(), 'uploads', 'products/waf/linux/v-1.0.0/waf.linux.deb'),
    
}

console.log(dlp_path)