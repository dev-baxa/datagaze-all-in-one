import * as path from 'path';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('products').del();

    // Inserts seed entries
    await knex('products').insert([
        {
            name: 'DLP',
            os_type: 'linux',
            icon_path: path.join(__dirname, '../../../../uploads/icons/dlp.png'),
            path: path.join(__dirname, '../../../../uploads/products/dlp.deb'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            scripts: {
                copy: 'sftp orqali',
                install: 'cd /path/to/extracted/app && npm install',
            },
        },
        {
            name: 'WAF',
            os_type: 'linux',
            icon_path: path.join(__dirname, '../../../../uploads/icons/waf.png'),
            path: path.join(__dirname, '../../../../uploads/products/waf.deb'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            scripts: {
                copy: 'sftp orqali',
                install: 'cd /path/to/extracted/app && npm install',
            },
        },
        {
            name: 'SIEM',
            os_type: 'linux',
            icon_path: path.join(__dirname, '../../../../uploads/icons/siem.png'),
            path: path.join(__dirname, '../../../../uploads/products/siem.deb'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            scripts: {
                copy: 'sftp orqali',
                install: 'cd /path/to/extracted/app && npm install',
            },
        },
        {
            name: 'SOC',
            os_type: 'linux',
            icon_path: path.join(__dirname, '../../../../uploads/icons/soc.png'),
            path: path.join(__dirname, '../../../../uploads/products/soc.deb'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            scripts: {
                copy: 'sftp orqali',
                install: 'cd /path/to/extracted/app && npm install',
            },
        },
        {
            name: 'ZOOM',
            os_type: 'linux',
            icon_path: path.join(__dirname, '../../../../uploads/icons/zoom.png'),
            path: path.join(__dirname, '../../../../uploads/products/zoom.deb'),
            min_requirements:
                'CPU-8 core , RAM 16 GB , storage 500 GB SSD, Network 1 Gbps Enthernet port',
            description:
                "Datagaze tomonidan ishlab chiqilgan hozirda yirik davlat tashkilotlari tomonida qo'llanilmoqda",
            scripts: {
                copy: 'sftp orqali',
                install: 'cd /path/to/extracted/app && npm install',
            },
        },
    ]);
}
