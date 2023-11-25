// module name => list of component names
type ImportMap = {[module: string]: string[]};

function imSetOrExtend(imports: ImportMap, module: string, component: string) {
    if (imports[module]) {
        imports[module].push(component);
    } else {
        imports[module] = [component];
    }
}

function imBuildImportLine(module: string, components: string[]): string {
    let listed: string = '';
    if (components.length == 1) {
        listed = components[0];
    } else {
        listed = components.sort().reduce((a, b) => `${a}, ${b}`);
    }
    return `import { ${listed} } from '${module}';\n`;
}

export function imBuildImportText(componentMap: {[component: string]: string}, usedComponents: string[]): string {

    // write down all components per module
    const imports: ImportMap = {};
    usedComponents.forEach(component => imSetOrExtend(imports, componentMap[component], component));

    // create a text containing the list of import statements
    return Object.keys(imports)
        .map(module => imBuildImportLine(module, imports[module]))
        .reduce((a, b) => `${a}${b}`, '')
        ;

}
