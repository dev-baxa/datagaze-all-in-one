import { IProduct } from '../../product/entities/product.interface';
import { OperationType } from '../entity/operation.types';

export function getScriptsForOperation(operationType: OperationType, product: IProduct): string {
    switch (operationType) {
        case OperationType.INSTALL:
            return product.install_scripts;
        case OperationType.UPDATE:
            return product.update_scripts;
        case OperationType.DELETE:
            return product.delete_scripts;
        default:
            throw new Error('Noto‘g‘ri operatsiya turi');
    }
}

export function parseScripts(scriptsText: string): string[] {
    return scriptsText
        .split('\n')
        .map(script => script.trim())
        .filter(script => script && !script.startsWith('#'));
}
