import * as path from 'path';

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('products').del();

    // Inserts seed entries
    await knex('products').insert([
        {
            name: 'DLP',
            icon_path: path.join(__dirname, '../../../../uploads/icons/dlp.png'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            publisher: 'Datagaze',
            agent_version: '1.0.0',
            server_version: '1.0.0',
            agent_path: path.join(
                __dirname,
                '../../../../uploads/products/agent/dlp-agent-1.0.0-linux.tar.gz',
            ),
            server_path: path.join(
                __dirname,
                '../../../../uploads/products/server/dlp-server-1.0.0-linux.tar.gz',
            ),
            install_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            update_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            delete_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
        },
        {
            name: 'WAF',
            icon_path: path.join(__dirname, '../../../../uploads/icons/waf.png'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            publisher: 'Datagaze',
            agent_version: '1.0.0',
            server_version: '1.0.0',
            agent_path: path.join(
                __dirname,
                '../../../../uploads/products/agent/waf-agent-1.0.0-linux.tar.gz',
            ),
            server_path: path.join(
                __dirname,
                '../../../../uploads/products/server/waf-server-1.0.0-linux.tar.gz',
            ),
            install_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            update_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            delete_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
        },
        {
            name: 'SIEM',
            icon_path: path.join(__dirname, '../../../../uploads/icons/siem.png'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            publisher: 'Datagaze',
            agent_version: '1.0.0',
            server_version: '1.0.0',
            agent_path: path.join(
                __dirname,
                '../../../../uploads/products/agent/siem-agent-1.0.0-linux.tar.gz',
            ),
            server_path: path.join(
                __dirname,
                '../../../../uploads/products/server/siem-server-1.0.0-linux.tar.gz',
            ),
            install_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            update_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            delete_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
        },
        {
            name: 'SOC',
            icon_path: path.join(__dirname, '../../../../uploads/icons/soc.png'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            publisher: 'Datagaze',
            agent_version: '1.0.0',
            server_version: '1.0.0',
            agent_path: path.join(
                __dirname,
                '../../../../uploads/products/agent/soc_agent-1.0.0-linux.tar.gz',
            ),
            server_path: path.join(
                __dirname,
                '../../../../uploads/products/server/soc_server-1.0.0-linux.tar.gz',
            ),
            install_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            update_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            delete_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
        },
        {
            name: 'ZOOM',
            icon_path: path.join(__dirname, '../../../../uploads/icons/zoom.png'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            publisher: 'Datagaze',
            agent_version: '1.0.0',
            server_version: '1.0.0',
            agent_path: path.join(
                __dirname,
                '../../../../uploads/products/agent/zoom-agent-1.0.0-linux.tar.gz',
            ),
            server_path: path.join(
                __dirname,
                '../../../../uploads/products/server/zoom-server-1.0.0-linux.tar.gz',
            ),
            install_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            update_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
            delete_scripts:
                'sudo timedatectl set-timezone Asia/Tashkent\n' +
                'sudo apt update && sudo apt upgrade -y\n' +
                'sudo apt install -y nginx\n' +
                'sudo systemctl status nginx\n' +
                'sudo systemctl status postgresql\n',
        },
    ]);
}
