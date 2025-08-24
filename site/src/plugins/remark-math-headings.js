import { visit } from 'unist-util-visit'
import { parseKatexString } from '../utils/katexTitle.ts'

/**
 * Remark plugin to process math expressions in headings
 * to prevent double rendering issues
 * Stores raw text in node.data.rawText for reference
 */
export function remarkMathHeadings() {
	return async (tree) => {
		const headings = []

		// First collect all headings
		visit(tree, 'heading', (node) => {
			headings.push(node)
		})

		// Then process each heading
		for (const node of headings) {
			// Check for math expressions in heading text
			if (
				node.children &&
				node.children.some(
					(child) =>
						(child.type === 'text' && /\$.*\$/.test(child.value)) ||
						child.type === 'math' ||
						child.type === 'inlineMath'
				)
			) {
				// Extract the raw text from the heading
				const rawText = node.children
					.map((child) => {
						if (child.type === 'text') return child.value
						if (child.type === 'math' || child.type === 'inlineMath') return `$${child.value}$`
						return ''
					})
					.join('')

				// collect the raw text
				node.children.push({
					type: 'html',
					value: `<span class="raw-heading" data-raw-text="${rawText}"></span>`
				})
			} else {
				node.children.push({
					type: 'html',
					value: `<span class="raw-heading" data-raw-text="${node.children.map((child) => child.value).join('')}"></span>`
				})
			}
		}
	}
}
