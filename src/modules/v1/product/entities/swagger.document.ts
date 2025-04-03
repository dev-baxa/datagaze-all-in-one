export const createProductSwagger = {
    description: 'Create product with file upload',
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
                description: 'Product icon file',
            },
            name: { type: 'string', example: 'DLP', description: 'Product name' },
            publisher: { type: 'string', example: 'DATAGAZE', description: 'Publisher name' },
            server_version: { type: 'string', example: '1.0.0', description: 'Server version' },
            agent_version: { type: 'string', example: '1.0.0', description: 'Agent version' },
            install_scripts: {
                type: 'string',
                example: 'echo "hello world"',
                description: 'Install scripts',
            },
            update_scripts: {
                type: 'string',
                example: 'echo "update script"',
                description: 'Update scripts',
            },
            delete_scripts: {
                type: 'string',
                example: 'echo "delete script"',
                description: 'Delete scripts',
            },
            description: {
                type: 'string',
                example: 'This is a product description',
                description: 'Product description',
            },
            min_requirements: {
                type: 'string',
                example: '4GB RAM, 2 CPUs',
                description: 'Minimum requirements',
            },
        },
    },
};
