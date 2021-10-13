export declare function createHost(tree: any): {
    readFile(path: any): Promise<any>;
    writeFile(path: any, data: any): Promise<any>;
    isDirectory(path: any): Promise<boolean>;
    isFile(path: any): Promise<any>;
};
