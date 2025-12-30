import { NextPage } from 'next'
import styled from '@emotion/styled'
import { Layout } from 'components/ui/Layout';
import { LayoutContainer, Heading2, Paragraph } from 'components/shared';
import { Button } from 'components/ui/Button';

export const page500 = {
	seoTags: {
		title: '500 – Server Error',
		description: 'An unexpected error occurred.',
	},
	title: '500',
	text: 'Something went wrong on our side. Please try again later.',
	button: {
		text: 'Go home',
		link: '/',
	},
}


const Section = styled.section`
	text-align: center;
	margin: 58px auto 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	& > * {
		margin-bottom: 32px;
		max-width: 448px;
	}
	a {
		margin-bottom: 0;
	}
`
const HeadingWrapper = styled.div`
	max-width: 545px;
`

const Custom500: NextPage = () => {
	return (
		<Layout>
			<LayoutContainer>
				<Section>
					<HeadingWrapper>
						<Heading2 text={page500.title} isDangerouslySet />
					</HeadingWrapper>
					<Paragraph text={page500.text} size="m" />
					<Button
						onClick={() => window.location.href = page500.button.link}
					>
						{page500.button.text}
					</Button>
				</Section>
			</LayoutContainer>
		</Layout>
	)
}

export default Custom500
