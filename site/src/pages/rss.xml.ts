import rss from '@astrojs/rss'
import { getCategoryName, getPosts } from '@/utils'
import { siteConfig } from '@/site-config'

export async function GET() {
	const posts = await getPosts()
	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			...post.data,
			link: `${getCategoryName(post.data.category)}/${post.slug}/`
		}))
	})
}
