export declare class SshReverseTransferService {
    private sshConfig;
    transferAndInstallApp(localFilePath: string, remoteFilePath: string): Promise<unknown>;
    checkLocalFile(filePath: string): Promise<boolean>;
}
