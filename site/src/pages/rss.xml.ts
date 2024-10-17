import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import {getAllCollection} from "@/utils"
import { siteConfig } from '@/site-config'

export async function get() {
	const posts = await getAllCollection()
	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			...post.data,
			link: `post/${post.slug}/`
		}))
	})
}
