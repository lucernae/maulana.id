import dotenv from 'dotenv'

dotenv.config()

interface SiteConfig {
	author: {
		name: string
		summary: string
	}
	title: string
	description: string
	siteUrl: string
	social: {
		twitter: string
		github: string
	}
	config: {
		categoryNameForAll: string
		paginationPageSize: number
		// contentPath: string
		// assetPath: string
		commentsEnabled: boolean
		commentsProps: {
			repo: string
			repoId: string
			category: string
			categoryId: string
			mapping: string
			strict: string
			reactionsEnabled: string
			emitMetadata: string
			inputPosition: string
			theme: string
			lang: string
			loading: string
		}
		googleAnalyticsProps: {
			trackingID: string
		}
	}
	lang: string
	ogLocale: string
	shareMessage: string
	paginationSize: number
}

export const siteConfig: SiteConfig = {
	author: {
		name: `Rizky Maulana Nugraha`,
		summary: `Software Developer. Currently remotely working from Indonesia.`
	},
	title: `Maulana's Personal Blog`,
	description: `Personal blog and notes about various stuffs`,
	siteUrl: `https://maulana.id/`,
	social: {
		twitter: `maulana_pcfre`,
		github: `lucernae`
	},
	config: {
		// contentPath: `${__dirname}/../content`,
		// assetPath: `${__dirname}/../assets`,
		categoryNameForAll: 'all',
		paginationPageSize: 6,
		commentsEnabled: true,
		commentsProps: {
			repo: 'lucernae/maulana.id',
			repoId: 'MDEwOlJlcG9zaXRvcnkyODI4NTE0MDM=',
			category: 'Announcements',
			categoryId: 'DIC_kwDOENv4S84CaVCv',
			mapping: 'url',
			strict: '0',
			reactionsEnabled: '1',
			emitMetadata: '1',
			inputPosition: 'top',
			theme: 'preferred_color_scheme',
			lang: 'en',
			loading: 'lazy'
		},
		googleAnalyticsProps: {
			trackingID: 'G-1F37WJ9JDF'
		}
	},
	lang: 'en-US',
	ogLocale: 'en_US',
	shareMessage: 'Share this post', // Message to share a post on social media
	paginationSize: 6 // Number of posts per page
}
