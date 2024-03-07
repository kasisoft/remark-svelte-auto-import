import path from 'path';

import { joinStrings } from '$main/utils';
import { ImportMap } from '$main/datatypes';

function imSetOrExtend(imports: ImportMap, module: string, component: string) {
    if (imports[module]) {
        imports[module].push(component);
    } else {
        imports[module] = [component];
    }
}

function imBuildImportLine(module: string, components: string[]): string {

    // a default import is indicated by the suffix (typically .svelte)
    /** @todo [26-NOV-2023:KASI]   Should we check for a 'export default' string instead? */
    const defaultImport = path.basename(module).lastIndexOf('.') != -1;

    const listed        = joinStrings(components.sort());
    if (defaultImport && (components.length == 1)) {
        return `import ${listed} from '${module}';\n`;
    } else {
        return `import { ${listed} } from '${module}';\n`;
    }

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
