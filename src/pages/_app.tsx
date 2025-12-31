import type { AppProps, NextWebVitalsMetric } from 'next/app';
import { useRouter } from 'next/router';
import { createContext, useEffect, useRef, useState } from 'react';
import { globalStyles } from 'style';
import { AuthProvider } from 'contexts/AuthContext';
import { ThemeProvider } from 'contexts/ThemeContext';

interface AppContextInterface {
	isFirstLoad: boolean
}

export const AppContext = createContext<AppContextInterface>({} as AppContextInterface)

// Simple GTM event trigger (stub implementation)
const triggerEventGTM = (event: any) => {
	if (typeof window !== 'undefined' && window.dataLayer) {
		window.dataLayer.push(event);
	}
};

const ChairCareApp = ({ Component, pageProps }: AppProps) => {
	const isBrowser = typeof window !== 'undefined'

	// hacky way to ensure page-tracking is called on initial page load:
	const [initialRouteTracked, setInitialRouteTracked] = useState(false)

	const router = useRouter()
	const [isFirstLoad, setIsFirstLoad] = useState(true)

	/* Check if is the first load */

	const firstUpdate = useRef(true)
	useEffect(() => {
		if (firstUpdate.current) {
			firstUpdate.current = false
			return
		}
		setIsFirstLoad(false)
	})

	const triggerGoogle = (url: string) => {
		console.log('trigger-g-event')
		try {
			setTimeout(() => {
				triggerEventGTM({
					eventId: 'ChairCarePageView',
					info: {
						pagePath: url,
						event_label: 'ChairCarePageView',
						event_category: 'Page Statistics'
					}
				})
			}, 100)
			setTimeout(() => {
				triggerEventGTM({
					eventId: 'ChairCareBounceTest5s',
					info: {
						pagePath: url,
						event_label: 'ChairCareBounceTest5s',
						event_category: 'Page Statistics'
					}
				})
			}, 5000)

			setTimeout(() => {
				triggerEventGTM({
					eventId: 'ChairCareBounceTest20s',
					info: {
						pagePath: url,
						event_label: 'ChairCareBounceTest20s',
						event_category: 'Page Statistics'
					}
				})
			}, 20000)
		} catch (error) {
			console.error('GTM tracking error:', error);
		}
	}

	if (isBrowser && !initialRouteTracked && window.dataLayer && window.location.search === '') {
		triggerGoogle(window.location.href)
		setInitialRouteTracked(true)
	}

	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			// console.log('handleRouteChangeStart url', url)
		}

		const handleRouteChangeComplete = (url: string) => {
			// console.log('handleRouteChangeComplete url', url)
			try {
				triggerGoogle(url)
			} catch (error) {
				console.error('Route change tracking error:', error);
			}
		}

		const handleRouteChangeError = (err: any, url: string) => {
			console.error('handleRouteChangeError err', err)
			// Don't trigger tracking on route errors to prevent further issues
		}
		//When the component is mounted, subscribe to router changes
		//and log those page views
		router.events.on('routeChangeStart', handleRouteChangeStart)
		router.events.on('routeChangeComplete', handleRouteChangeComplete)
		router.events.on('routeChangeError', handleRouteChangeError)

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method
		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart)
			router.events.off('routeChangeComplete', handleRouteChangeComplete)
			router.events.off('routeChangeError', handleRouteChangeError)
		}
	}, [router])

	return (
		<>
			{globalStyles}
			<ThemeProvider>
				<AuthProvider>
					<AppContext.Provider
						value={{
							isFirstLoad
						}}>
						<Component {...pageProps} />
					</AppContext.Provider>
				</AuthProvider>
			</ThemeProvider>
		</>
	)
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
	// console.log(metric)
}

export default ChairCareApp;
