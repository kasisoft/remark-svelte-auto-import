import { Literal, Node, Parent } from 'unist';
import { EXIT, visit } from 'unist-util-visit';

type NullableLiteral = Literal | null;

export function locateFrontmatterNode(tree: Node): NullableLiteral {

    let result: NullableLiteral = null;
    visit(tree, 'yaml', findFrontmatterNode);
    return result;

    function findFrontmatterNode(node: Literal) {
        result = node;
        return EXIT;
    }

}

export function locateScriptNode(tree: Node): NullableLiteral {

    let result: NullableLiteral = null;
    visit(tree, 'html', findScriptNode);
    return result;

    function findScriptNode(node: Literal) {
        if ((node.value as string).startsWith("<script")) {
            result = node;
            return EXIT;
        }
    }

}

export function getOrCreateScriptNode(tree: Parent, ts: boolean): Literal {

    let result = locateScriptNode(tree);
    if (result != null) {
        return result;
    }

    const langAttr = ts ? ' lang="ts"' : '';
    result = { type: 'html', value: '<script' + langAttr + '></script>' };

    const frontMatterNode = locateFrontmatterNode(tree);
    if (frontMatterNode) {
        const index   = tree.children.indexOf(frontMatterNode) + 1;
        tree.children = tree.children.slice(0, index).concat([result]).concat(tree.children.slice(index));
    } else {
        tree.children.unshift(result);
    }

    return result as Literal;

}

export function appendScriptText(scriptNode: Literal, text: string) {

    const scriptText = scriptNode.value as string;
    const closing    = scriptText.lastIndexOf('</script>');
    if (closing == -1) {
        // we're having a <script/> portion
        const endbracket = scriptText.indexOf('/>');
        scriptNode.value =
            scriptText.substring(0, endbracket) + '>\n' +
            text +
            '</script>'
            ;
    } else {
        scriptNode.value =
            scriptText.substring(0, closing) + '\n' +
            text +
            scriptText.substring(closing)
            ;
    }

}