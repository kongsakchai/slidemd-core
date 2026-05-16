import type { Directive } from '@slidemd/parse'

import type { SlideDirective, SlidePageStore } from '../types'
import { asString } from './coerce'

export function resolveDirectives(directive: Directive) {
	const local: Directive = {}
	const shared: Directive = {}

	for (const key of Object.keys(directive)) {
		if (key.startsWith('_')) {
			local[key.slice(1)] = directive[key]
		} else {
			local[key] = key in local ? local[key] : directive[key]
			shared[key] = directive[key]
		}
	}
	return { local, shared }
}

export function makeSlideDirective(directive: Directive, store: SlidePageStore): SlideDirective {
	let bg = ''
	let showPage = false

	store.page++

	if (directive['background']) {
		bg += `background: ${directive['background']};`
	}
	if (directive['background-color']) {
		bg += `background-color: ${directive['background-color']};`
	}
	if (directive['background-image']) {
		bg += `background-image: ${directive['background-image']};`
	}
	if (directive['background-size']) {
		bg += `background-size: ${directive['background-size']};`
	}
	if (directive['background-position']) {
		bg += `background-position: ${directive['background-position']};`
	}
	if (directive['opacity']) {
		bg += `opacity: ${directive['opacity']};`
	}
	if (directive['paginate']) {
		switch (directive['paginate']) {
			case true:
				showPage = true
				break
			case 'skip':
				showPage = false
				store.page--
				break
			case 'hold':
				showPage = true
				store.page--
				break
		}
	}

	return {
		class: asString(directive.class, ''),
		style: asString(directive.style, ''),
		page: showPage ? `<div class="slide-page-number">${store.page}</div>` : '',
		footer: '',
		header: '',
		background: bg ? `<div class='slide-background' style='${bg}'></div>` : ''
	}
}
