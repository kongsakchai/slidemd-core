import type { SlideData } from '@lib/types.js'

export enum PageAction {
	NEXT,
	PREVIOUS
}

export class SlideState {
	#slide = $state<SlideData>({ title: '', markdown: '', pages: [] })
	#page = $state(1)
	#step = $state(0)
	#maxPage = $derived(this.#slide?.pages.length || 0)
	#scale = $state(1)

	constructor(data: SlideData) {
		this.#slide = data
	}

	get page() {
		return this.#page
	}

	get step() {
		return this.#step
	}

	get maxPage() {
		return this.#maxPage
	}

	get maxStep() {
		return this.#slide.pages[this.#page - 1].step
	}

	get scale() {
		return this.#scale
	}

	set scale(value: number) {
		this.#scale = value
	}

	update(action: PageAction) {
		switch (action) {
			case PageAction.NEXT:
				if (this.#step < this.maxStep) {
					this.#step += 1
				} else if (this.#page < this.#slide.pages.length) {
					this.#page += 1
				}
				return

			case PageAction.PREVIOUS:
				if (this.#step > 0) {
					this.#step -= 1
				}
				if (this.#page > 1) {
					this.#page -= 1
				}
				return
		}
	}
}
