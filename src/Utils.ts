namespace MarkdownIME.Utils {
	
	export namespace Pattern {
		export namespace NodeName {
			export var list = /^(UL|OL)$/;
			export var li = /^LI$/;
			export var line = /^(P|DIV|H\d)$/;
			export var blockquote = /^BLOCKQUOTE$/;
			export var pre = /^PRE$/;
			export var hr = /^HR$/;
		}
	}
	
	/**
	 * Move the cursor to the end of one element.
	 */
	export function move_cursor_to_end(ele : Node) {
		var selection = ele.ownerDocument.defaultView.getSelection();
		var range = ele.ownerDocument.createRange();
		var focusNode = ele;
		while (focusNode.nodeType == 1) {
			var children = focusNode.childNodes;
			var t = children[children.length - 1];
			if (!t) break;
			focusNode = t;
		}
		range.selectNode(focusNode);
		range.collapse((focusNode.nodeName == "BR" || /^\n+$/.test(focusNode.textContent)));
		selection.removeAllRanges();
		selection.addRange(range);
	}
	
	/**
	 * Check if it's a BR or empty stuff.
	 */
	export function is_node_empty(node : Node, regardBrAsEmpty : boolean = true) {
		return	(node.nodeType == Node.TEXT_NODE && /^[\s\r\n]*$/.test(node.nodeValue)) || 
				(node.nodeType == Node.COMMENT_NODE) ||
				(regardBrAsEmpty && node.nodeName == "BR");
	}
	
	/**
	 * revert is_node_empty()
	 */
	export function is_node_not_empty(node : Node) {
		return !is_node_empty(node);
	}
	
	/**
	 * Check if one node is a container for text line
	 */
	export function is_node_block(node : Node) {
		if (node.nodeType != 1) return false;
		return (
			Pattern.NodeName.line.test(node.nodeName) ||
			Pattern.NodeName.li.test(node.nodeName) ||
			Pattern.NodeName.pre.test(node.nodeName)
		);
	}
	
	/**
	 * Check if one line container can be processed.
	 */
	export function is_line_container_clean(wrapper : Node) {
		var children = get_real_children(wrapper);
		var ci : number = children.length;
		if (ci == 1 && children[0].nodeType == 1) {
			//cracking nuts like <p><i><b>LEGACY</b></i></p>
			return is_line_container_clean(children[0]);
		}
		while (ci--) {
			var node = children[ci];
			if (node.nodeType == Node.TEXT_NODE) continue;	//textNode pass
			return false;
		}
		return true;
	}
	
	/**
	 * Check if one line is empty
	 */
	export function is_line_empty(line : HTMLElement) : boolean {
		if (line.textContent.length != 0) return false;
		if (line.innerHTML.indexOf('<img ') >= 0) return false;
		return true;
	}
	
	/**
	 * Get the previousSibling big block wrapper or create one.
	 * @note every char in blockTagName shall be upper, like "BLOCKQUOTE"
	 */
	export function get_or_create_prev_block(node : Node, blockTagName : string) : Node {
		var rtn : Node = node.previousSibling;
		if (!rtn || rtn.nodeName != blockTagName) {
			rtn = node.ownerDocument.createElement(blockTagName);
			node.parentNode.insertBefore(rtn, node);
		}
		return rtn;
	}
	
	/**
	 * Find all non-empty children
	 */
	export function get_real_children(node : Node) : Array<Node> {
		return [].filter.call(node.childNodes, is_node_not_empty);
	}
	
	/**
	 * Get all nodes on the same line. 
	 * This is for lines like <br>...<br>. it is recommended to use TextNode as the anchor. 
	 * If the anchor is <br>, nodes before it will be in return.
	 */
	export function get_line_nodes(anchor : Node, wrapper : Node) : Array<Node> {
		var rtn = [];
		var tmp : Node;
		tmp = anchor.previousSibling;
		//...
		return rtn;
	}
	
	/**
	 * Find the path to one certain container.
	 * @return {Array<Node>} 
	 */
	export function build_parent_list(node : Node, end : Node) : Array<Node> {
		var rtn : Array<Node> = [];
		var iter : Node = node;
		while (true) {
			iter = iter.parentNode;
			if (!iter) break;
			rtn.push(iter);
			if (iter == end) break;
		}
		return rtn;
	}
	
	/**
	 * text2html
	 */
	export function text2html(text : string) {
		return text.replace(/&/g, '&amp;').replace(/  /g, '&nbsp;&nbsp;').replace(/"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
	}
	
	/**
	 * help one element wear a wrapper
	 */
	export function wrap(wrapper : Node, node : Node) {
		node.parentNode.replaceChild(wrapper, node);
		wrapper.appendChild(node);
	}
}