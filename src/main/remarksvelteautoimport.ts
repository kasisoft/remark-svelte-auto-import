import { VFile } from 'vfile';
import { Parent } from 'unist';

import { ComponentMap, RemarkSvelteAutoImportOptions } from '$main/datatypes';
import { containsTag } from '$main/utils';
import { appendScriptText, getOrCreateScriptNode } from '$main/astutils';
import { imBuildImportText } from '$main/importmap';

function collectUsedTags(content: string, tags: string[]): string[] {
    return Array.from(new Set<string>(tags.filter(tag => containsTag(content, tag))));
}

function getFileContent(file: VFile): string {
    /**
     * @todo [24-NOV-2023:KASI]   Figure out a proper way to access the textual
     *                            content. I might not have a grasp yet on the
     *                            remark/unified infrastructure though this
     *                            seems to work fine for now.
     */
    let result = '';
    if (file.hasOwnProperty('contents')) {
        result = (file as any)['contents'];
    } else if (file.hasOwnProperty('value')) {
        result = file.value as string;
    }
    return result;
}

export function pluginImpl(config: RemarkSvelteAutoImportOptions, tree: Parent, file: VFile, componentMap: ComponentMap) {

    const content = getFileContent(file);
    if (content.length == 0) {
        return;
    }

    const componentTags  = Object.keys(componentMap);
    const usedComponents = collectUsedTags(content, componentTags);
    if (usedComponents.length == 0) {
        // none of our registered components is being used, so no changes necessary
        return;
    }

    const scriptNode = getOrCreateScriptNode(tree, config.scriptTS ?? false);
    appendScriptText(scriptNode, imBuildImportText(componentMap, usedComponents));

}
