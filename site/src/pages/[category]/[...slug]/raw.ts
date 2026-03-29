import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { getPosts, getCategoryName, sluglify } from '@/utils'

export async function getStaticPaths() {
	const posts = await getPosts()

	return posts.map((post) => ({
		params: {
			slug: post.slug,
			category: sluglify(getCategoryName(post.data.category).toLowerCase())
		},
		props: { post }
	}))
}

export const GET: APIRoute = async ({ props }) => {
	const { post } = props as any

	// Return the raw markdown/MDX content
	return new Response(post.body, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
