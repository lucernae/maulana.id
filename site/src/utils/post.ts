import { getCollection } from 'astro:content'
import { CATEGORIES } from '@/data/categories.ts'
import { unsluglify } from './sluglify.ts'
import { siteConfig } from '@/site-config'

export const getAllCollection = async () => {
	const allPosts = [
		await getCollection('blog'),
		await getCollection('soft-dev'),
		await getCollection('llm'),
		await getCollection('sandbox')
	]
	const filteredPosts = allPosts.flat().filter((c) => {
		return c.data.title !== undefined
	})
	return filteredPosts
}

export const getCategories = async () => {
	// const posts = await getCollection('blog')
	const posts = await getAllCollection()
	const categories = new Set(posts.map((post) => getCategoryName(post.data.category)))
	return Array.from(categories)
}

export const getCategoryTitleFromSlug = (cat: string | any) => {
	const name = getCategoryName(cat)
	const title = CATEGORIES.find((o) => o.slug === name)?.title
	return title || unsluglify(cat)
}

export const getCategoryName = (cat: string | any) => {
	switch (typeof cat) {
		case 'string':
			return cat
		case 'object':
			return cat.name
	}
	return cat
}

export const getPosts = async (max?: number) => {
	// return (await getCollection('soft-dev'))
	return (await getAllCollection())
		.filter((post) => !post.data.draft && !post.data.index)
		.map((post) => {
			post.data.pubDate = post.data.pubDate || post.data.date
			if (post.data.pubDate === undefined) {
				post.data.pubDate = new Date()
			}
			if (post.data.tags === undefined) {
				post.data.tags = []
			}
			if (post.data.comments === undefined) {
				post.data.comments = siteConfig.config.commentsEnabled
			}
			if (post.data.features === undefined) {
				post.data.features = []
			}
			return post
		})
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.slice(0, max)
}

export const getTags = async () => {
	// const posts = await getCollection('blog')
	// const posts = await getAllCollection()
	const posts = await getPosts()
	const tags = new Set()
	posts.forEach((post) => {
		post.data.tags.forEach((tag: any) => {
			tags.add(tag.toLowerCase())
		})
	})

	return Array.from(tags)
}

export const getIndexPageByCategory = async (category: string) => {
	const posts = await getAllCollection()
	return posts.find(
		(post) => post.data.index && getCategoryName(post.data.category).toLowerCase() === category
	)
}

export const getPostByTag = async (tag: string) => {
	const posts = await getPosts()
	const lowercaseTag = tag.toLowerCase()
	return posts.filter((post) => {
		return post.data.tags.some((postTag: any) => postTag.toLowerCase() === lowercaseTag)
	})
}

export const filterPostsByCategory = async (category: string) => {
	const posts = await getPosts()
	return posts.filter((post) => getCategoryName(post.data.category).toLowerCase() === category)
}
