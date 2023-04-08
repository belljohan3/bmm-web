import { GetTrackCollectionModel, TrackCollectionApi } from "@bcc-code/bmm-sdk-fetch";

interface UseTrackCollectionOptions {
	id: number
}

/**
 * Get specific track collection
 */
export function useTrackCollection(options: UseTrackCollectionOptions) {
	const { id } = options

	const collection = useState<GetTrackCollectionModel>(`track-collection-${id}`, () => ({}))
	const error = ref<any>()
	const pending = ref(true)

	new TrackCollectionApi()
		.trackCollectionIdGet({ id })
		.then(data => {
			collection.value = data
		})
		.catch(err => {
			error.value = err
		})
		.finally(() => {
			pending.value = false
		})


	return {
		collection,
		error,
		pending
	}
}

/**
 * Get all track collections
 */
export function useTrackCollections() {
	const collections = useState<GetTrackCollectionModel[]>('track-collections', () => [])
	const error = ref<any>()
	const pending = ref(true)

	new TrackCollectionApi()
		.trackCollectionGet()
		.then(data => {
			collections.value = data
		})
		.catch(err => {
			error.value = err
		})
		.finally(() => {
			pending.value = false
		})

	return {
		collections,
		error,
		pending
	}
}