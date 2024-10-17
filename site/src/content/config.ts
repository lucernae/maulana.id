import { defineCollection, z } from 'astro:content'
import { CATEGORIES } from '@/data/categories'
import { siteConfig } from '@/site-config'

const post = defineCollection({
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string().max(80),
			description: z.string().optional(),
			index: z.boolean().default(false),
			date: z.string().or(z.date()).optional(),
			// Transform string to Date object
			pubDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val))
				.optional(),
			heroImage: image().optional(),
			category: z
				.enum([CATEGORIES[0].slug, ...CATEGORIES.slice(1).map((c) => c.slug)])
				.or(z.string())
				.or(
					z.object({
						name: z.string(),
						index: z.number().optional(),
						depth: z.number().optional()
					})
				),
			tags: z.array(z.string()).default([]),
			layout_name: z.string().optional(),
			comments: z.boolean().default(siteConfig.config.commentsEnabled),
			draft: z.boolean().default(false)
		})
})

export const collections = { post }
