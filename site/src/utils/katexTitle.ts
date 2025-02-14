import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

export async function parseKatexString(text: string) {
	try {
		const processor = unified()
			.use(remarkParse)
			.use(remarkMath)
			.use(remarkRehype, {
				allowDangerousHtml: true
			})
			.use(rehypeKatex, {
				throwOnError: false,
				strict: false
			})
			.use(rehypeStringify, {
				allowDangerousHtml: true
			})
		const file = await processor.process(text)
		return String(file)
	} catch (error) {
		console.error('Error parsing KaTeX string: ', error)
		return text
	}
}
